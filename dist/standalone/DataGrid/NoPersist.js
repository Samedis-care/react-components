import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { DataGridPersistentStateContext } from "./StatePersistence";
/**
 * Clears the current persistence provider for DataGrid.
 */
const NoPersist = (props) => {
    const { children } = props;
    return (_jsx(DataGridPersistentStateContext.Provider, { value: undefined, children: children }));
};
export default React.memo(NoPersist);
