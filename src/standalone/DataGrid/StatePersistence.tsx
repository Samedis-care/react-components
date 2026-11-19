import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
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
} from "./PersistFormat";

export type {
	DataGridPersistedData,
	DataGridPersistedSort,
	DataGridPersistedSortList,
	DataGridPersistentState,
	DataGridPersistentStateLegacy,
} from "./PersistFormat";

export type DataGridPersistentStateContextType = [
	/**
	 * The persisted data, in whichever format it was written: what the setter
	 * got last, or what was stored before
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
	 * Throw, or return a promise which rejects, when the data could not be
	 * stored. The grid logs the error to the console and calls the setter
	 * again with its next state update (a page of rows loaded, a selection,
	 * a change), with its current data, changed or not. The grid does not
	 * wait for a returned promise before it calls the setter with a change.
	 */
	(data: DataGridPersistentState) => Promise<void> | void,
];
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
	const [, setPersisted] = persistedContext || [];
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

	const defaultColumnState = useMemo(
		() => getDataGridDefaultColumnsState(columns, defaultSort, defaultFilter),
		[columns, defaultSort, defaultFilter],
	);

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
			defaultColumnState,
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
			defaultColumnState,
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

		// the setter may throw or reject: the storage is full, the server fails.
		// What is stored is unknown then, also when a newer write has started
		// since: that one may have left a part to this one (as
		// DataGridStorageManagerPersist skips a bucket being written already)
		new Promise<void>((resolve) => resolve(setPersisted(data))).catch(
			(err: unknown) => {
				// eslint-disable-next-line no-console
				console.error("[Components-Care] [DataGrid] Persist: ", err);
				lastWritten.current = null;
			},
		);
	}, [
		setPersisted,
		state,
		columnState,
		columnWidthState,
		defaultColumnState,
		columns,
		config,
		replaced,
	]);

	return <></>;
};

export default React.memo(StatePersistence);
