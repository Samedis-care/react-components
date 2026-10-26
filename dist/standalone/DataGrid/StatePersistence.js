import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { getDataGridDefaultColumnsState, useDataGridColumnState, useDataGridColumnsWidthState, useDataGridProps, useDataGridState, } from "./DataGrid";
import { decodePersistedState, encodePersistedState, } from "./PersistFormat";
export const DataGridPersistentStateContext = React.createContext(undefined);
/**
 * The column state with the given column filters in place of its own
 * @param columnState The column state
 * @param columnFilter The column filters (field -> filter)
 */
const withColumnFilter = (columnState, columnFilter) => Object.fromEntries(Object.entries(columnState).map(([field, entry]) => [
    field,
    { ...entry, filter: columnFilter[field] },
]));
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
    const { persist: config, columns, defaultSort, defaultFilter, defaultCustomData, overrideFilter, overrideCustomData, overrideSearch, } = useDataGridProps();
    const defaultColumnState = useMemo(() => getDataGridDefaultColumnsState(columns, defaultSort, defaultFilter), [columns, defaultSort, defaultFilter]);
    // the grid only applies the overrides when it opens, so this is the moment
    // to keep what they replaced: what a plain visit would have started with
    const [replaced] = useState(() => {
        if (!setPersisted)
            return null;
        if (overrideFilter == null &&
            overrideCustomData == null &&
            overrideSearch == null)
            return null;
        const stored = decodePersistedState(persistedContext?.[0], columns, defaultColumnState, config);
        return {
            customData: overrideCustomData != null
                ? (stored.state.customData ?? defaultCustomData ?? {})
                : undefined,
            columnFilter: overrideFilter != null
                ? Object.fromEntries(Object.entries(stored.columnState).map(([field, entry]) => [
                    field,
                    entry.filter,
                ]))
                : undefined,
            search: overrideSearch != null ? (stored.state.search ?? "") : undefined,
        };
    });
    // the grid state changes on every page of data loaded, so compare what we'd
    // write before writing it - persistence may well be a request to a server
    const lastWritten = useRef(undefined);
    // save on changes
    useEffect(() => {
        if (!setPersisted)
            return;
        const kept = state.filtersOverridden ? replaced : null;
        const data = encodePersistedState(kept
            ? {
                ...state,
                customData: kept.customData ?? state.customData,
                search: kept.search ?? state.search,
            }
            : state, kept?.columnFilter
            ? withColumnFilter(columnState, kept.columnFilter)
            : columnState, columnWidthState, defaultColumnState, columns, config);
        const serialized = JSON.stringify(data);
        if (lastWritten.current === serialized)
            return;
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
    return _jsx(_Fragment, {});
};
export default React.memo(StatePersistence);
