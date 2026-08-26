import React from "react";
import { DataGridPersistedData, DataGridPersistentState } from "./PersistFormat";
export type { DataGridPersistedData, DataGridPersistedSort, DataGridPersistentState, DataGridPersistentStateLegacy, } from "./PersistFormat";
export type DataGridPersistentStateContextType = [
    /**
     * The persisted data, in whichever format it was written
     */
    DataGridPersistedData | undefined,
    /**
     * Store the given data
     */
    (data: DataGridPersistentState) => Promise<void> | void
];
export declare const DataGridPersistentStateContext: React.Context<DataGridPersistentStateContextType | undefined>;
declare const _default: React.MemoExoticComponent<() => React.JSX.Element>;
export default _default;
