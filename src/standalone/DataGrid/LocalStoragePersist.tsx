import React, { useCallback, useMemo } from "react";
import {
	DataGridPersistentState,
	DataGridPersistentStateContext,
	DataGridPersistentStateContextType,
} from "./StatePersistence";

export interface LocalStoragePersistProps {
	/**
	 * The local storage key to use for persisting
	 */
	storageKey: string;
	/**
	 * The children to render
	 */
	children: React.ReactNode;
}

/**
 * A persistence provider for DataGrid.
 * Uses localStorage for storage.
 * Wrap around DataGrid component to archive persistence
 */
const LocalStoragePersist = (props: LocalStoragePersistProps) => {
	const { storageKey, children } = props;

	const setData = useCallback(
		(data: DataGridPersistentState) => {
			try {
				localStorage?.setItem(storageKey, JSON.stringify(data));
			} catch (e) {
				// eslint-disable-next-line no-console
				console.error(
					"[Components-Care] Failed to persist DataGrid config in localStorage." +
						storageKey,
					e,
				);
			}
		},
		[storageKey],
	);

	const persistCtx = useMemo(() => {
		const dataStr = localStorage?.getItem(storageKey);
		let data: Partial<DataGridPersistentState> | undefined;
		if (dataStr) {
			try {
				data = JSON.parse(dataStr) as Partial<DataGridPersistentState>;
			} catch (e) {
				// eslint-disable-next-line no-console
				console.error(
					"[Components-Care] Failed parsing DataGrid config from localStorage." +
						storageKey,
					"Removing from localStorage",
				);
				localStorage?.removeItem(storageKey);
			}
		}
		return [data, setData] as DataGridPersistentStateContextType;
	}, [setData, storageKey]);

	return (
		<DataGridPersistentStateContext.Provider value={persistCtx}>
			{children}
		</DataGridPersistentStateContext.Provider>
	);
};

export default React.memo(LocalStoragePersist);
