import React, { useCallback, useMemo } from "react";
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
 */
const StorageManagerPersist = (props: StorageManagerPersistProps) => {
	const { storageKeys, children } = props;

	const setData = useCallback(
		async (data: DataGridPersistentState) => {
			const [sizing, rest] = splitPersistedState(data);
			await Promise.all([
				Promise.resolve(
					StorageManager.setItem(
						DATA_GRID_STORAGE_KEY_COLUMN_SIZING,
						storageKeys,
						JSON.stringify(sizing),
					),
				),
				Promise.resolve(
					StorageManager.setItem(
						DATA_GRID_STORAGE_KEY_FILTERS,
						storageKeys,
						JSON.stringify(rest),
					),
				),
			]);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[JSON.stringify(storageKeys)],
	);

	// wrapped in a tuple so "loaded, but nothing stored" stays distinguishable
	// from "still loading" (useAsyncMemo yields null while it runs)
	const data = useAsyncMemo(async (): Promise<
		[DataGridPersistedData | undefined]
	> => {
		const resultObjects = await Promise.all(
			[DATA_GRID_STORAGE_KEY_COLUMN_SIZING, DATA_GRID_STORAGE_KEY_FILTERS].map(
				async (storageKey) => {
					const dataStr = await StorageManager.getItem(storageKey, storageKeys);
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
							await StorageManager.setItem(storageKey, storageKeys, null);
							return undefined;
						}
					}
				},
			),
		);
		return [mergePersistedState(resultObjects)];
	}, [JSON.stringify(storageKeys)]);

	const persistCtx = useMemo(() => {
		return [data?.[0], setData] as DataGridPersistentStateContextType;
	}, [data, setData]);

	if (!data) return <Loader />;
	return (
		<DataGridPersistentStateContext.Provider value={persistCtx}>
			{children}
		</DataGridPersistentStateContext.Provider>
	);
};

export default React.memo(StorageManagerPersist);
