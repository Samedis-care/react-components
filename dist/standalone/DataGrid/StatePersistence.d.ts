import React from "react";
import { DataGridPersistedData, DataGridPersistentState } from "./PersistFormat";
export type { DataGridPersistedData, DataGridPersistedSort, DataGridPersistedSortList, DataGridPersistentState, DataGridPersistentStateLegacy, } from "./PersistFormat";
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
     * Store the given data, and provide it from now on.
     *
     * A grid calls it when the data it persists changes: a filter, sort,
     * search or custom data change, a column shown, hidden, pinned or resized,
     * the first auto-fit of the column widths. It does not call it when it
     * opens, so what it opened on stays stored as it is until one of these
     * changes; data in an older format is written in the current one then.
     *
     * Data in a newer format (a `v` higher than DATA_GRID_PERSIST_VERSION,
     * written by a newer library version) is read with this version's rules,
     * so what that version stores elsewhere starts from the defaults. The
     * first auto-fit of the column widths does not write it either: only one
     * of the other changes does, in this version's format.
     */
    (data: DataGridPersistentState) => Promise<void> | void
];
export declare const DataGridPersistentStateContext: React.Context<DataGridPersistentStateContextType | undefined>;
declare const _default: React.MemoExoticComponent<() => React.JSX.Element>;
export default _default;
