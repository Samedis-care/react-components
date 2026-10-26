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
} from "./PersistFormat";

export type {
	DataGridPersistedData,
	DataGridPersistedSort,
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
	 * Store the given data, and provide it from now on
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
	// write before writing it - persistence may well be a request to a server
	const lastWritten = useRef<string>(undefined);

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
		if (lastWritten.current === serialized) return;
		lastWritten.current = serialized;

		void setPersisted(data);
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
