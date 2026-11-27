import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { DataGridPersistentStateContext } from "./StatePersistence";
import { DataGridPersistMountContext } from "./PersistGate";
/**
 * Clears the current persistence provider for DataGrid.
 *
 * The grids inside persist nothing, and an outer provider does not hold them
 * back while it loads its stored state, nor mount them again when its
 * storage keys change.
 */
const NoPersist = (props) => {
    const { children } = props;
    return (_jsx(DataGridPersistMountContext.Provider, { value: null, children: _jsx(DataGridPersistentStateContext.Provider, { value: undefined, children: children }) }));
};
export default React.memo(NoPersist);
