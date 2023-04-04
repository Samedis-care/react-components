import React from "react";
import { DataGridPersistentStateContext } from "./StatePersistence";
/**
 * Clears the current persistence provider for DataGrid.
 */
var NoPersist = function (props) {
    var children = props.children;
    return (React.createElement(DataGridPersistentStateContext.Provider, { value: undefined }, children));
};
export default React.memo(NoPersist);
