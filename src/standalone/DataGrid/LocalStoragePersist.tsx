import React, { useCallback, useMemo, useState } from "react";
import {
	DataGridPersistedData,
	DataGridPersistentState,
	DataGridPersistentStateContext,
	DataGridPersistentStateContextType,
} from "./StatePersistence";
import {
	DataGridPersistMountContext,
	DataGridPersistMountContextType,
} from "./PersistGate";

export interface LocalStoragePersistProps {
	/**
	 * The localStorage key the grids inside read their state from and write it
	 * to, used as it is. Grids with different DataGridProps.persist settings
	 * keep each other's parts of the entry; grids that persist the same part
	 * share it.
	 *
	 * localStorage belongs to the browser profile, not to the signed-in user:
	 * include the user (and the tenant) in the key when several accounts may
	 * use one browser, or the search and filters of one account show up for
	 * the next.
	 *
	 * When it changes, the grids inside are mounted again, so they open with
	 * what is stored under the new key. Everything else inside stays mounted
	 * and keeps its state. Keyboard focus in a grid moves to the same control
	 * of the grid mounted again (to its first control, if that one is not
	 * there).
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
 * A change of storageKey mounts the grids inside again, as a grid reads the
 * persisted state when it mounts only; the rest of the children stay
 * mounted.
 *
 * Other tabs are not followed: the entry is read when the provider mounts
 * and when storageKey changes, and a grid writes the parts it persists as it
 * has them. So the tab that writes last decides them, also those another
 * tab changed meanwhile.
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

	// a grid reads the persisted state when it mounts: one mounted for the
	// previous key would keep showing that key's state, and write it under
	// this one, so the grids are mounted anew for each key
	const mountCtx = useMemo(
		(): DataGridPersistMountContextType => ({
			loading: false,
			mount: storageKey,
		}),
		[storageKey],
	);

	const persistCtx = useMemo(
		() =>
			[
				written?.[0] === storageKey ? written[1] : stored,
				setData,
			] as DataGridPersistentStateContextType,
		[written, storageKey, stored, setData],
	);

	return (
		<DataGridPersistMountContext.Provider value={mountCtx}>
			<DataGridPersistentStateContext.Provider value={persistCtx}>
				{children}
			</DataGridPersistentStateContext.Provider>
		</DataGridPersistMountContext.Provider>
	);
};

export default React.memo(LocalStoragePersist);
