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
import Loader from "../Loader";

export interface StorageManagerPersistProps {
	/**
	 * The storage keys to use for persisting
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
 * A persistence provider for DataGrid.
 * Uses storage manager for storage.
 * Wrap around DataGrid component to archive persistence
 *
 * A bucket that cannot be read (the storage throws or rejects) is logged, and
 * the children render with that bucket's part at the grid defaults. That
 * bucket is not written for these storage keys, so what is stored there is
 * not replaced by the defaults; it is read again when the storage keys change
 * or the provider mounts again. A bucket that does not parse is deleted.
 *
 * A bucket is only written when its part of the state differs from what it
 * holds, as read or last written: a column resize writes the sizing bucket
 * alone, the search the filters bucket alone. A bucket whose write failed is
 * written again with the next change.
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

	// wrapped in a tuple so "loaded, but nothing stored" stays distinguishable
	// from "still loading" (useAsyncMemo yields null while it runs). The
	// factory never rejects, a rejection would keep the Loader up for good.
	const data = useAsyncMemo(async (): Promise<
		[
			DataGridPersistedData | undefined,
			unreadable: string[],
			read: ReadonlyMap<string, string | null>,
		]
	> => {
		const unreadable: string[] = [];
		// what each bucket which could be read holds
		const read = new Map<string, string | null>();
		const resultObjects = await Promise.all(
			[DATA_GRID_STORAGE_KEY_COLUMN_SIZING, DATA_GRID_STORAGE_KEY_FILTERS].map(
				async (storageKey) => {
					let dataStr: string | null;
					try {
						dataStr = await StorageManager.getItem(storageKey, storageKeys);
						read.set(storageKey, dataStr);
					} catch (e) {
						// eslint-disable-next-line no-console
						console.error(
							"[Components-Care] Failed reading DataGrid config from StorageManager." +
								storageKey,
							storageKeys,
							"Not writing it for these storage keys",
							e,
						);
						unreadable.push(storageKey);
						return undefined;
					}
					if (dataStr) {
						try {
							return JSON.parse(dataStr) as DataGridPersistedData;
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
								.then(() =>
									StorageManager.setItem(storageKey, storageKeys, null),
								)
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
					}
				},
			),
		);
		return [mergePersistedState(resultObjects), unreadable, read];
	}, [storageKeysJson]);
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
					// what the bucket holds is unknown now, the next change writes it
					if (values.get(storageKey) === value) values.delete(storageKey);
					throw e;
				}
			};
			await Promise.all([
				write(DATA_GRID_STORAGE_KEY_COLUMN_SIZING, sizing),
				write(DATA_GRID_STORAGE_KEY_FILTERS, rest),
			]);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[storageKeysJson, unreadable, read],
	);

	const persistCtx = useMemo(
		() =>
			[
				written?.[0] === storageKeysJson ? written[1] : data?.[0],
				setData,
			] as DataGridPersistentStateContextType,
		[written, storageKeysJson, data, setData],
	);

	if (!data) return <Loader />;
	return (
		<DataGridPersistentStateContext.Provider value={persistCtx}>
			{children}
		</DataGridPersistentStateContext.Provider>
	);
};

export default React.memo(StorageManagerPersist);
