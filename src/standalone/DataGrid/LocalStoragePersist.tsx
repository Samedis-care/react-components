import React, {
	useCallback,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	DataGridPersistedData,
	DataGridPersistentState,
	DataGridPersistentStateContext,
	DataGridPersistentStateContextType,
} from "./StatePersistence";
import {
	DataGridFocusHandoff,
	DataGridFocusHandoffContext,
	DataGridFocusHandoffContextType,
} from "./FocusHandoff";

export interface LocalStoragePersistProps {
	/**
	 * The localStorage key the grids inside read their state from and write it
	 * to.
	 *
	 * When it changes, the children are mounted again, so the grids open with
	 * what is stored under the new key. Everything else inside is mounted
	 * again as well and loses its state. Keyboard focus in a grid moves to
	 * the same control of the grid mounted again (to its first control, if
	 * that one is not there); focus elsewhere inside falls back to the page.
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

	// where focus was in a grid mounted for the previous key, until the grid
	// mounted for this one takes it over (see DataGridFocusHandoffContext)
	const focusHandoff = useRef<DataGridFocusHandoff | null>(null);
	// the children are mounted anew for each key
	const focusCtx = useMemo(
		(): DataGridFocusHandoffContextType => ({
			handoff: focusHandoff,
			mount: storageKey,
		}),
		[storageKey],
	);
	// layout effects of the children run first: the grids mounted for this key
	// have taken focus over; what is left had no grid to take it
	useLayoutEffect(() => {
		focusHandoff.current = null;
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
		<DataGridFocusHandoffContext.Provider value={focusCtx}>
			<DataGridPersistentStateContext.Provider value={persistCtx}>
				<React.Fragment key={storageKey}>{children}</React.Fragment>
			</DataGridPersistentStateContext.Provider>
		</DataGridFocusHandoffContext.Provider>
	);
};

export default React.memo(LocalStoragePersist);
