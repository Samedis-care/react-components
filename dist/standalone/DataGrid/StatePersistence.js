import React, { useContext, useEffect } from "react";
import { useDataGridColumnState, useDataGridColumnsWidthState, useDataGridState, } from "./DataGrid";
export var DataGridPersistentStateContext = React.createContext(undefined);
/**
 * Logical component which takes care of optional state persistence for the data grid
 * @remarks Used internally in DataGrid, do not use in your code!
 */
var StatePersistence = function () {
    var persistedContext = useContext(DataGridPersistentStateContext);
    var _a = persistedContext || [], setPersisted = _a[1];
    var state = useDataGridState()[0];
    var columnState = useDataGridColumnState()[0];
    var columnWidthState = useDataGridColumnsWidthState()[0];
    // save on changes
    useEffect(function () {
        if (!setPersisted)
            return;
        void setPersisted({
            columnState: columnState,
            columnWidth: columnWidthState,
            state: {
                search: state.search,
                hiddenColumns: state.hiddenColumns,
                lockedColumns: state.lockedColumns,
                customData: state.customData,
                initialResize: state.initialResize,
            },
        });
    }, [setPersisted, state, columnState, columnWidthState]);
    return React.createElement(React.Fragment, null);
};
export default React.memo(StatePersistence);
