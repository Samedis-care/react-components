import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React, { useContext, useEffect, useRef, useState } from "react";
import { getDataGridDefaultColumnsState, useDataGridColumnState, useDataGridColumnsWidthState, useDataGridProps, useDataGridState, } from "./DataGrid";
import { decodePersistedState, encodePersistedState, isNewerPersistedState, keepStoredParts, } from "./PersistFormat";
import { captureError } from "../../framework/ErrorReporting";
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
    const [stored, setPersisted] = persistedContext || [];
    const [state] = useDataGridState();
    const [columnState] = useDataGridColumnState();
    const [columnWidthState] = useDataGridColumnsWidthState();
    const { persist: config, columns, defaultSort, defaultFilter, defaultCustomData, overrideFilter, overrideCustomData, overrideSearch, } = useDataGridProps();
    // the grid only applies the overrides when it opens, so this is the moment
    // to keep what they replaced: what a plain visit would have started with
    const [replaced] = useState(() => {
        if (!setPersisted)
            return null;
        if (overrideFilter == null &&
            overrideCustomData == null &&
            overrideSearch == null)
            return null;
        const stored = decodePersistedState(persistedContext?.[0], columns, getDataGridDefaultColumnsState(columns, defaultSort, defaultFilter), config);
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
    // write before writing it - persistence may well be a request to a server.
    // The first run sees the state the grid opened with, decoded from what is
    // stored. It is the baseline, not written: writing it would only replace
    // what this visit could not read (a column it doesn't have, a newer format).
    // null after a failed write: what is stored is unknown then, so the next
    // run writes, whether the data changed or not. A state without a JSON form
    // is neither the baseline nor written
    const lastWritten = useRef(undefined);
    // the error last reported for a state without a JSON form, so that neither
    // the next state update (a page of rows loaded) nor StrictMode's second
    // effect run reports it again
    const reported = useRef(null);
    // data a newer library version wrote may keep the column widths where this
    // version doesn't look. The auto-fit then fills them in, and writing that
    // would replace the data with what this visit could not read, so until
    // the grid has written, an auto-fit only moves the baseline.
    const keepNewer = useRef(isNewerPersistedState(persistedContext?.[0]));
    // the auto-fit is what sets initialResize, once the grid knows its width
    const lastInitialResize = useRef(state.initialResize);
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
            : columnState, columnWidthState, columns, config);
        // a BigInt, or an object that refers back to itself, has no JSON form:
        // the state is not written then, and that is logged and reported once
        const notWritten = (err) => {
            const key = String(err);
            if (reported.current === key)
                return;
            reported.current = key;
            const error = new Error("The DataGrid state has no JSON form, so it is not persisted. Keep the custom data to JSON values (see DataGridCustomDataType)", { cause: err });
            // eslint-disable-next-line no-console
            console.error("[Components-Care] [DataGrid] Persist: ", error);
            captureError(error, { source: "DataGrid.persist" });
        };
        let serialized;
        try {
            serialized = JSON.stringify(data);
        }
        catch (err) {
            notWritten(err);
            // what is stored stays what was written last. A grid that opened
            // with this state has no baseline: its first state with a JSON form
            // is a change, and written
            if (lastWritten.current === undefined)
                lastWritten.current = null;
            return;
        }
        const autoFit = state.initialResize && !lastInitialResize.current;
        lastInitialResize.current = state.initialResize;
        if (lastWritten.current === undefined) {
            lastWritten.current = serialized;
            return;
        }
        if (lastWritten.current === serialized)
            return;
        lastWritten.current = serialized;
        if (keepNewer.current && autoFit)
            return;
        keepNewer.current = false;
        // the parts this grid does not persist stay as they are stored. The
        // provider gets the data as JSON values, so what it hands out is what
        // its storage gives back after a reload (a Date as its ISO string)
        const whole = keepStoredParts(data, stored, config);
        let payload;
        try {
            payload = JSON.parse(whole === data ? serialized : JSON.stringify(whole));
        }
        catch (err) {
            // a part the provider handed out has no JSON form: nothing is
            // written, so the next run tries again
            notWritten(err);
            lastWritten.current = null;
            return;
        }
        // the setter may throw or reject: the storage is full, the server fails.
        // What is stored is unknown then, also when a newer write has started
        // since: that one may have left a part to this one (as
        // DataGridStorageManagerPersist skips a bucket being written already)
        new Promise((resolve) => resolve(setPersisted(payload))).catch((err) => {
            // eslint-disable-next-line no-console
            console.error("[Components-Care] [DataGrid] Persist: ", err);
            lastWritten.current = null;
        });
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
    return _jsx(_Fragment, {});
};
export default React.memo(StatePersistence);
