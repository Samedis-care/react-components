import React, { useCallback, useMemo } from "react";
import {
	DataGridPersistentState,
	DataGridPersistentStateContext,
	DataGridPersistentStateContextType,
} from "./StatePersistence";
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
			const { columnWidth, ...otherData } = data;
			const { initialResize, ...otherState } = otherData.state;
			await Promise.all([
				StorageManager.setItem(
					DATA_GRID_STORAGE_KEY_COLUMN_SIZING,
					storageKeys,
					JSON.stringify({
						columnWidth,
						state: {
							initialResize,
						},
					}),
				),
				StorageManager.setItem(
					DATA_GRID_STORAGE_KEY_FILTERS,
					storageKeys,
					JSON.stringify({
						...otherData,
						state: {
							...otherState,
						},
					}),
				),
			]);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[JSON.stringify(storageKeys)],
	);

	const data = useAsyncMemo(async (): Promise<
		Partial<DataGridPersistentState>
	> => {
		const resultObjects = await Promise.all(
			[DATA_GRID_STORAGE_KEY_COLUMN_SIZING, DATA_GRID_STORAGE_KEY_FILTERS].map(
				async (storageKey) => {
					const dataStr = await StorageManager.getItem(storageKey, storageKeys);
					if (dataStr) {
						try {
							return JSON.parse(dataStr) as Partial<DataGridPersistentState>;
						} catch (e) {
							// eslint-disable-next-line no-console
							console.error(
								"[Components-Care] Failed parsing DataGrid config from StorageManager." +
									storageKey,
								storageKeys,
								"Removing from server",
								e,
							);
							return StorageManager.setItem(storageKey, storageKeys, null);
						}
					}
				},
			),
		);
		return resultObjects.reduce<Partial<DataGridPersistentState>>(
			(prev, next) => Object.assign(prev, next),
			{},
		);
	}, [JSON.stringify(storageKeys)]);

	const persistCtx = useMemo(() => {
		return [data, setData] as DataGridPersistentStateContextType;
	}, [data, setData]);

	if (!data) return <Loader />;
	return (
		<DataGridPersistentStateContext.Provider value={persistCtx}>
			{children}
		</DataGridPersistentStateContext.Provider>
	);
};

export default React.memo(StorageManagerPersist);
