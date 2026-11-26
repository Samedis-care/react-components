import React, { useContext, useEffect, useRef, useState } from "react";
import {
	DataGridCustomDataType,
	getDataGridDefaultColumnsState,
	IDataGridColumnsState,
	useDataGridColumnState,
	useDataGridColumnsWidthState,
	useDataGridProps,
	useDataGridState,
} from "./DataGrid";
import type { IFilterDef } from "./Content/FilterEntry";
import {
	DataGridPersistedData,
	DataGridPersistentState,
	decodePersistedState,
	encodePersistedState,
	isNewerPersistedState,
	keepStoredParts,
} from "./PersistFormat";

export type {
	DataGridPersistedData,
	DataGridPersistedFilterList,
	DataGridPersistedSort,
	DataGridPersistedSortList,
	DataGridPersistentState,
	DataGridPersistentStateLegacy,
} from "./PersistFormat";

/**
 * What a persistence provider hands the grids inside it
 * (DataGridPersistentStateContext): the persisted data and its setter
 */
export type DataGridPersistentStateContextType = [
	/**
	 * The persisted data, in whichever format it was written: what the setter
	 * got last, or what was stored before. undefined: nothing is stored.
	 *
	 * A grid reads it when it mounts only: data handed out later (a load that
	 * finishes after the grid opened) does not reach that grid. A provider
	 * that loads the data asynchronously says that it is loading through
	 * DataGridPersistMountContext, which holds the grids back until then.
	 * @remarks This is the state a grid restores, not necessarily the one it
	 *          shows: an override (DataGridProps.overrideFilter,
	 *          overrideCustomData, overrideSearch) isn't persisted. What a
	 *          grid shows comes from DataGridDispatch.getQuery.
	 */
	DataGridPersistedData | undefined,
	/**
	 * Store the given data, and provide it from now on.
	 *
	 * A grid calls it when the data it persists changes: a filter, sort,
	 * search or custom data change, a column shown, hidden, pinned or resized,
	 * the first auto-fit of the column widths. It does not call it when it
	 * opens, so what it opened on stays stored as it is until one of these
	 * changes; data in an older format is written in the current one then.
	 *
	 * Data in a newer format (a `v` higher than DATA_GRID_PERSIST_VERSION,
	 * written by a newer library version) is read with this version's rules,
	 * so what that version stores elsewhere starts from the defaults. The
	 * first auto-fit of the column widths does not write it either: only one
	 * of the other changes does, in this version's format.
	 *
	 * The data is a new object of JSON values, the JSON form of the grid's
	 * state (a Date in the custom data is its ISO string, an undefined value
	 * is left out), so a provider that hands it out hands out what its
	 * storage gives back after a reload. It is the whole state: the parts the
	 * grid persists (DataGridProps.persist), and the others as the provider
	 * handed them out (legacy data in the current format; nothing of data in
	 * a newer format).
	 *
	 * Throw, or return a promise which rejects, when the data could not be
	 * stored. The grid logs the error to the console and calls the setter
	 * again with its next state update (a page of rows loaded, a selection,
	 * a change), with its current data, changed or not. The grid does not
	 * wait for a returned promise before it calls the setter with a change.
	 */
	(data: DataGridPersistentState) => Promise<void> | void,
];
/**
 * The persistence provider of the grids inside: undefined for none, so the
 * grids open at their defaults and persist nothing.
 * DataGridLocalStoragePersist and DataGridStorageManagerPersist provide it,
 * DataGridNoPersist clears it.
 *
 * A custom provider provides a memoized DataGridPersistentStateContextType,
 * and hands out what the setter got last, so a grid mounted again starts
 * from the current state. A grid reads the data when it mounts only, and
 * takes undefined as "nothing stored". So a provider that loads the data
 * asynchronously also provides DataGridPersistMountContext, loading until
 * the data is there: a grid mounted while the data loads opens at its
 * defaults, and its first change writes them over the stored state.
 */
export const DataGridPersistentStateContext = React.createContext<
	DataGridPersistentStateContextType | undefined
>(undefined);

/**
 * What the overrides replaced when the grid opened: the stored values, which
 * are persisted in their place
 * @see IDataGridState.filtersOverridden
 */
interface ReplacedFilters {
	/**
	 * The stored custom data, if overrideCustomData replaced it
	 */
	customData?: DataGridCustomDataType;
	/**
	 * The stored column filters (field -> filter), if overrideFilter replaced
	 * them
	 */
	columnFilter?: Record<string, IFilterDef | undefined>;
	/**
	 * The stored search, if overrideSearch replaced it
	 */
	search?: string;
}

/**
 * The column state with the given column filters in place of its own
 * @param columnState The column state
 * @param columnFilter The column filters (field -> filter)
 */
const withColumnFilter = (
	columnState: IDataGridColumnsState,
	columnFilter: Record<string, IFilterDef | undefined>,
): IDataGridColumnsState =>
	Object.fromEntries(
		Object.entries(columnState).map(([field, entry]) => [
			field,
			{ ...entry, filter: columnFilter[field] },
		]),
	);

/**
 * Logical component which takes care of optional state persistence for the data grid
 * @remarks Used internally in DataGrid, do not use in your code!
 */
const StatePersistence = () => {
	const persistedContext = useContext(DataGridPersistentStateContext);
	const [stored, setPersisted] = persistedContext || [];
	const [state] = useDataGridState();
	const [columnState] = useDataGridColumnState();
	const [columnWidthState] = useDataGridColumnsWidthState();
	const {
		persist: config,
		columns,
		defaultSort,
		defaultFilter,
		defaultCustomData,
		overrideFilter,
		overrideCustomData,
		overrideSearch,
	} = useDataGridProps();

	// the grid only applies the overrides when it opens, so this is the moment
	// to keep what they replaced: what a plain visit would have started with
	const [replaced] = useState((): ReplacedFilters | null => {
		if (!setPersisted) return null;
		if (
			overrideFilter == null &&
			overrideCustomData == null &&
			overrideSearch == null
		)
			return null;
		const stored = decodePersistedState(
			persistedContext?.[0],
			columns,
			getDataGridDefaultColumnsState(columns, defaultSort, defaultFilter),
			config,
		);
		return {
			customData:
				overrideCustomData != null
					? (stored.state.customData ?? defaultCustomData ?? {})
					: undefined,
			columnFilter:
				overrideFilter != null
					? Object.fromEntries(
							Object.entries(stored.columnState).map(([field, entry]) => [
								field,
								entry.filter,
							]),
						)
					: undefined,
			search: overrideSearch != null ? (stored.state.search ?? "") : undefined,
		};
	});

	// the grid state changes on every page of data loaded, so compare what we'd
	// write before writing it - persistence may well be a request to a server.
	// The first run sees the state the grid opened with, decoded from what is
	// stored. It is the baseline, not written: writing it would only replace
	// what this visit could not read (a column it doesn't have, a newer format).
	// null after a failed write: what is stored is unknown then, so the next
	// run writes, whether the data changed or not
	const lastWritten = useRef<string | null>(undefined);

	// data a newer library version wrote may keep the column widths where this
	// version doesn't look. The auto-fit then fills them in, and writing that
	// would replace the data with what this visit could not read, so until
	// the grid has written, an auto-fit only moves the baseline.
	const keepNewer = useRef(isNewerPersistedState(persistedContext?.[0]));
	// the auto-fit is what sets initialResize, once the grid knows its width
	const lastInitialResize = useRef(state.initialResize);

	// save on changes
	useEffect(() => {
		if (!setPersisted) return;

		const kept = state.filtersOverridden ? replaced : null;
		const data = encodePersistedState(
			kept
				? {
						...state,
						customData: kept.customData ?? state.customData,
						search: kept.search ?? state.search,
					}
				: state,
			kept?.columnFilter
				? withColumnFilter(columnState, kept.columnFilter)
				: columnState,
			columnWidthState,
			columns,
			config,
		);
		const serialized = JSON.stringify(data);
		const autoFit = state.initialResize && !lastInitialResize.current;
		lastInitialResize.current = state.initialResize;
		if (lastWritten.current === undefined) {
			lastWritten.current = serialized;
			return;
		}
		if (lastWritten.current === serialized) return;
		lastWritten.current = serialized;
		if (keepNewer.current && autoFit) return;
		keepNewer.current = false;

		// the parts this grid does not persist stay as they are stored. The
		// provider gets the data as JSON values, so what it hands out is what
		// its storage gives back after a reload (a Date as its ISO string)
		const whole = keepStoredParts(data, stored, config);
		const payload = JSON.parse(
			whole === data ? serialized : JSON.stringify(whole),
		) as DataGridPersistentState;

		// the setter may throw or reject: the storage is full, the server fails.
		// What is stored is unknown then, also when a newer write has started
		// since: that one may have left a part to this one (as
		// DataGridStorageManagerPersist skips a bucket being written already)
		new Promise<void>((resolve) => resolve(setPersisted(payload))).catch(
			(err: unknown) => {
				// eslint-disable-next-line no-console
				console.error("[Components-Care] [DataGrid] Persist: ", err);
				lastWritten.current = null;
			},
		);
	}, [
		setPersisted,
		stored,
		state,
		columnState,
		columnWidthState,
		columns,
		config,
		replaced,
	]);

	return <></>;
};

export default React.memo(StatePersistence);
