import React from "react";
import { DataGridPersistedData, DataGridPersistentState } from "./PersistFormat";
export type { DataGridPersistedData, DataGridPersistedSort, DataGridPersistentState, DataGridPersistentStateLegacy, } from "./PersistFormat";
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
    (data: DataGridPersistentState) => Promise<void> | void
];
export declare const DataGridPersistentStateContext: React.Context<DataGridPersistentStateContextType | undefined>;
declare const _default: React.MemoExoticComponent<() => React.JSX.Element>;
export default _default;
