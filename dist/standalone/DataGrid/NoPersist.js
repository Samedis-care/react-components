import React from "react";
import { DataGridPersistentStateContext } from "./StatePersistence";
/**
 * Clears the current persistence provider for DataGrid.
 */
const NoPersist = (props) => {
    const { children } = props;
    return (React.createElement(DataGridPersistentStateContext.Provider, { value: undefined }, children));
};
export default React.memo(NoPersist);
