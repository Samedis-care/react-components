import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React, { useContext, useEffect, useMemo, useRef } from "react";
import { getDataGridDefaultColumnsState, useDataGridColumnState, useDataGridColumnsWidthState, useDataGridProps, useDataGridState, } from "./DataGrid";
import { encodePersistedState, } from "./PersistFormat";
export const DataGridPersistentStateContext = React.createContext(undefined);
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
    const { persist: config, columns, defaultSort, defaultFilter, } = useDataGridProps();
    const defaultColumnState = useMemo(() => getDataGridDefaultColumnsState(columns, defaultSort, defaultFilter), [columns, defaultSort, defaultFilter]);
    // the grid state changes on every page of data loaded, so compare what we'd
    // write before writing it - persistence may well be a request to a server
    const lastWritten = useRef(undefined);
    // save on changes
    useEffect(() => {
        if (!setPersisted)
            return;
        const data = encodePersistedState(state, columnState, columnWidthState, defaultColumnState, columns, config);
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
    ]);
    return _jsx(_Fragment, {});
};
export default React.memo(StatePersistence);
