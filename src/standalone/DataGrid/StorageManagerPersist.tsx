import React, { useCallback, useMemo, useRef, useState } from "react";
import {
	DataGridPersistedData,
	DataGridPersistentState,
	DataGridPersistentStateContext,
	DataGridPersistentStateContextType,
} from "./StatePersistence";
import { mergePersistedState, splitPersistedState } from "./PersistFormat";
import { StorageManager } from "../../framework/Storage";
import useAsyncMemo from "../../utils/useAsyncMemo";
import {
	DataGridPersistMountContext,
	DataGridPersistMountContextType,
} from "./PersistGate";

export interface StorageManagerPersistProps {
	/**
	 * The storage keys to use for persisting. When they change (compared as
	 * JSON), the grids inside are mounted again, with the state stored under
	 * the new keys.
	 *
	 * The order of the keys is part of the key a bucket is stored under (see
	 * GetStorageProviderCallback): `{ tenant, model }` and
	 * `{ model, tenant }` are two different stored states. Build the object in
	 * the same order everywhere.
	 */
	storageKeys: Record<string, string>;
	/**
	 * The children to render
	 */
	children: React.ReactNode;
}

const DATA_GRID_STORAGE_KEY_BASE = "data-grid-";

// recommended default: localStorage
export const DATA_GRID_STORAGE_KEY_COLUMN_SIZING =
	DATA_GRID_STORAGE_KEY_BASE + "column-sizing";

// recommended default: server storage
export const DATA_GRID_STORAGE_KEY_FILTERS =
	DATA_GRID_STORAGE_KEY_BASE + "filters";

/**
 * The buckets, in the order their parts are merged
 */
const BUCKETS = [
	DATA_GRID_STORAGE_KEY_COLUMN_SIZING,
	DATA_GRID_STORAGE_KEY_FILTERS,
];

/**
 * What the buckets hold for a set of storage keys: the persisted data (a
 * tuple, so "loaded, but nothing stored" stays distinguishable from "still
 * loading"), the buckets which could not be read, and what each bucket which
 * could be read holds
 */
type LoadedBuckets = [
	DataGridPersistedData | undefined,
	unreadable: string[],
	read: ReadonlyMap<string, string | null>,
];

/**
 * What the storage answered for a bucket: what it holds, or null if it could
 * not be read
 */
type BucketAnswer = { held: string | null } | null;

/**
 * Asks the storage what a bucket holds. A bucket which cannot be read (the
 * storage throws or rejects) is logged.
 * @param storageKey The bucket
 * @param storageKeys The storage keys
 * @returns The answer, synchronously if the storage answers synchronously
 */
const askBucket = (
	storageKey: string,
	storageKeys: Record<string, string>,
): BucketAnswer | Promise<BucketAnswer> => {
	const failed = (e: unknown): BucketAnswer => {
		// eslint-disable-next-line no-console
		console.error(
			"[Components-Care] Failed reading DataGrid config from StorageManager." +
				storageKey,
			storageKeys,
			"Not writing it for these storage keys",
			e,
		);
		return null;
	};
	let answer: ReturnType<typeof StorageManager.getItem>;
	try {
		answer = StorageManager.getItem(storageKey, storageKeys);
	} catch (e) {
		return failed(e);
	}
	if (typeof answer === "string" || answer === null) return { held: answer };
	return Promise.resolve(answer).then((held) => ({ held }), failed);
};

/**
 * The part of the state a bucket holds. A bucket which does not parse is
 * logged and deleted.
 * @param storageKey The bucket
 * @param storageKeys The storage keys
 * @param held What the bucket holds
 * @returns The part, or undefined if there is none
 */
const parseBucket = (
	storageKey: string,
	storageKeys: Record<string, string>,
	held: string | null,
): DataGridPersistedData | undefined => {
	if (!held) return undefined;
	try {
		return JSON.parse(held) as DataGridPersistedData;
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error(
			"[Components-Care] Failed parsing DataGrid config from StorageManager." +
				storageKey,
			storageKeys,
			"Removing from server",
			e,
		);
		// deleted without waiting for it, the grids can open meanwhile
		Promise.resolve()
			.then(() => StorageManager.setItem(storageKey, storageKeys, null))
			.catch((deleteError: unknown) => {
				// eslint-disable-next-line no-console
				console.error(
					"[Components-Care] Failed removing DataGrid config from StorageManager." +
						storageKey,
					storageKeys,
					deleteError,
				);
			});
		return undefined;
	}
};

/**
 * Reads both buckets
 * @param storageKeys The storage keys
 * @returns What they hold, synchronously if the storage answers both
 *          synchronously. Never rejects: a bucket which cannot be read is
 *          reported in `unreadable`.
 */
const loadBuckets = (
	storageKeys: Record<string, string>,
): LoadedBuckets | Promise<LoadedBuckets> => {
	const answers = BUCKETS.map((storageKey) =>
		askBucket(storageKey, storageKeys),
	);
	const combine = (settled: BucketAnswer[]): LoadedBuckets => {
		const unreadable: string[] = [];
		const read = new Map<string, string | null>();
		const parts = settled.map((answer, index) => {
			const storageKey = BUCKETS[index];
			if (!answer) {
				unreadable.push(storageKey);
				return undefined;
			}
			read.set(storageKey, answer.held);
			return parseBucket(storageKey, storageKeys, answer.held);
		});
		return [mergePersistedState(parts), unreadable, read];
	};
	// both answered synchronously, or wait for both
	const answered: BucketAnswer[] = [];
	for (const answer of answers) {
		if (answer instanceof Promise)
			return Promise.all(
				answers.map((pending) => Promise.resolve(pending)),
			).then(combine);
		answered.push(answer);
	}
	return combine(answered);
};

/**
 * A persistence provider for DataGrid.
 * Uses storage manager for storage.
 * Wrap around DataGrid component to archive persistence
 *
 * A bucket that cannot be read (the storage throws or rejects) is logged, and
 * the grids open with that bucket's part at the grid defaults. That
 * bucket is not written for these storage keys, so what is stored there is
 * not replaced by the defaults; it is read again when the storage keys change
 * or the provider mounts again. A bucket that does not parse is deleted.
 *
 * A bucket is only written when its part of the state differs from what it
 * holds, as read or last written: a column resize writes the sizing bucket
 * alone, the search the filters bucket alone. A bucket which cannot be
 * written (the storage throws or rejects) does not keep the other one from
 * being written. The setter then rejects, once both writes are done, with an
 * error naming the bucket (an AggregateError of both when both failed); the
 * grid logs it and hands its data over again with its next state update,
 * which writes the failed bucket again.
 *
 * The children render at once; only the grids inside wait for the stored
 * state. A Loader takes the place of each grid until both buckets are
 * loaded, and the grid opens with what they hold then. A storage that answers
 * synchronously (localStorage and sessionStorage, StorageManager's default
 * routing) is read while rendering, so the grids open at once, without a
 * Loader. Until the buckets are loaded, DataGridPersistentStateContext is
 * undefined inside the provider, as outside of one.
 *
 * When the storage keys change, the grids inside are mounted again for the
 * new keys, after a Loader in their place while those load; everything else
 * inside stays mounted and keeps its state. Keyboard focus in a grid moves
 * to the Loader meanwhile, and then to the same control of the grid mounted
 * again (to its first control, if that one is not there), unless focus was
 * moved elsewhere in between.
 *
 * Other tabs and devices are not followed: the buckets are read when the
 * provider mounts and when the storage keys change, and a grid writes the
 * parts it persists as it has them. So the tab that writes last decides
 * them, also those another tab changed meanwhile.
 * @remarks The data it provides is what was written last, so a grid mounted
 *          later (or anything else reading the context) starts from the
 *          current state, not from the state loaded on mount
 */
const StorageManagerPersist = (props: StorageManagerPersistProps) => {
	const { storageKeys, children } = props;
	const storageKeysJson = JSON.stringify(storageKeys);

	// the storage is only read once per storage keys, so what was written since
	// is kept here, together with the keys it was written for
	const [written, setWritten] = useState<
		[string, DataGridPersistentState] | null
	>(null);

	// read while rendering, once per storage keys: a storage that answers
	// synchronously has the grids open in the first render
	const loading = useMemo(
		() => loadBuckets(storageKeys),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[storageKeysJson],
	);
	// what a storage that answers asynchronously loaded, with the storage keys
	// it is for: in the render in which they change, this still holds what was
	// loaded for the previous ones
	const { value: loaded } = useAsyncMemo(
		async () =>
			loading instanceof Promise
				? ([storageKeysJson, await loading] as const)
				: null,
		[loading],
	);
	const data =
		loading instanceof Promise
			? loaded?.[0] === storageKeysJson
				? loaded[1]
				: null
			: loading;
	const unreadable = data?.[1];
	const read = data?.[2];

	// per bucket, what it holds as far as this provider knows: what was read,
	// then what was written last. Kept per read, so other storage keys, and
	// storage keys read again, start from what is stored for them.
	const stored = useRef<
		[read: typeof read, values: Map<string, string | null>] | null
	>(null);

	const setData = useCallback(
		async (data: DataGridPersistentState) => {
			setWritten([storageKeysJson, data]);
			if (!stored.current || stored.current[0] !== read)
				stored.current = [read, new Map(read)];
			const values = stored.current[1];
			const [sizing, rest] = splitPersistedState(data);
			const write = async (
				storageKey: string,
				part: DataGridPersistentState,
			) => {
				// writing a bucket which could not be read would replace what is
				// stored in it with what the grid opened with instead
				if (unreadable?.includes(storageKey)) return;
				const value = JSON.stringify(part);
				// a change is mostly to one bucket: a resize, a filter, the search
				if (values.get(storageKey) === value) return;
				values.set(storageKey, value);
				try {
					await StorageManager.setItem(storageKey, storageKeys, value);
				} catch (e) {
					// what the bucket holds is unknown now, the next call writes it
					if (values.get(storageKey) === value) values.delete(storageKey);
					throw new Error(
						"Failed writing DataGrid config to StorageManager." +
							storageKey +
							" " +
							storageKeysJson,
						{ cause: e },
					);
				}
			};
			// one bucket which cannot be written does not keep the other from
			// being written, and the caller hears of each that failed
			const failures = (
				await Promise.allSettled([
					write(DATA_GRID_STORAGE_KEY_COLUMN_SIZING, sizing),
					write(DATA_GRID_STORAGE_KEY_FILTERS, rest),
				])
			).flatMap((result) =>
				result.status === "rejected" ? [result.reason as unknown] : [],
			);
			if (failures.length > 1)
				throw new AggregateError(
					failures,
					"Failed writing DataGrid config to StorageManager",
				);
			if (failures.length > 0) throw failures[0];
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[storageKeysJson, unreadable, read],
	);

	// the grids inside wait for the data, and are mounted anew for each
	// storage keys (see DataGridPersistMountContext)
	const isLoading = !data;
	const mountCtx = useMemo(
		(): DataGridPersistMountContextType => ({
			loading: isLoading,
			mount: storageKeysJson,
		}),
		[isLoading, storageKeysJson],
	);

	const persistCtx = useMemo(
		(): DataGridPersistentStateContextType | undefined =>
			data
				? [written?.[0] === storageKeysJson ? written[1] : data[0], setData]
				: undefined,
		[written, storageKeysJson, data, setData],
	);

	return (
		<DataGridPersistMountContext.Provider value={mountCtx}>
			<DataGridPersistentStateContext.Provider value={persistCtx}>
				{children}
			</DataGridPersistentStateContext.Provider>
		</DataGridPersistMountContext.Provider>
	);
};

export default React.memo(StorageManagerPersist);
