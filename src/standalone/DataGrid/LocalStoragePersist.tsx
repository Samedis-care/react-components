import React, { useCallback, useMemo, useState } from "react";
import {
	DataGridPersistedData,
	DataGridPersistentState,
	DataGridPersistentStateContext,
	DataGridPersistentStateContextType,
} from "./StatePersistence";

export interface LocalStoragePersistProps {
	/**
	 * The localStorage key the grids inside read their state from and write it
	 * to.
	 *
	 * When it changes, the children are mounted again, so the grids open with
	 * what is stored under the new key. Everything else inside is mounted
	 * again as well: it loses its state, and keyboard focus inside it falls
	 * back to the page.
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
 *
 * A change of storageKey mounts the children again, as a grid reads the
 * persisted state when it mounts only.
 *
 * If the browser blocks localStorage (blocked site data, some sandboxed
 * iframes), the grids open at their defaults and nothing is kept for the next
 * visit; the failed reads and writes are logged to the console.
 * @remarks The data it provides is what was written last, so a grid mounted
 *          later (or anything else reading the context) starts from the
 *          current state, not from the state loaded on mount
 */
const LocalStoragePersist = (props: LocalStoragePersistProps) => {
	const { storageKey, children } = props;

	// localStorage is only read once per storage key, so what was written since
	// is kept here, together with the key it was written for
	const [written, setWritten] = useState<
		[string, DataGridPersistentState] | null
	>(null);

	const setData = useCallback(
		(data: DataGridPersistentState) => {
			setWritten([storageKey, data]);
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

	const stored = useMemo(() => {
		let dataStr: string | null | undefined;
		try {
			// reading window.localStorage throws, too, when the browser blocks it
			dataStr = localStorage?.getItem(storageKey);
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error(
				"[Components-Care] Failed reading DataGrid config from localStorage." +
					storageKey,
				e,
			);
			return undefined;
		}
		let data: DataGridPersistedData | undefined;
		if (dataStr) {
			try {
				data = JSON.parse(dataStr) as DataGridPersistedData;
			} catch (e) {
				// eslint-disable-next-line no-console
				console.error(
					"[Components-Care] Failed parsing DataGrid config from localStorage." +
						storageKey,
					"Removing from localStorage",
					e,
				);
				try {
					localStorage?.removeItem(storageKey);
				} catch (removeError) {
					// eslint-disable-next-line no-console
					console.error(
						"[Components-Care] Failed removing DataGrid config from localStorage." +
							storageKey,
						removeError,
					);
				}
			}
		}
		return data;
	}, [storageKey]);

	const persistCtx = useMemo(
		() =>
			[
				written?.[0] === storageKey ? written[1] : stored,
				setData,
			] as DataGridPersistentStateContextType,
		[written, storageKey, stored, setData],
	);

	// a grid reads the persisted state when it mounts: one mounted for the
	// previous key would keep showing that key's state, and write it under
	// this one
	return (
		<DataGridPersistentStateContext.Provider value={persistCtx}>
			<React.Fragment key={storageKey}>{children}</React.Fragment>
		</DataGridPersistentStateContext.Provider>
	);
};

export default React.memo(LocalStoragePersist);
