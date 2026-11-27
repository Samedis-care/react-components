import React from "react";
import { DataGridPersistedData, DataGridPersistentState } from "./PersistFormat";
export type { DataGridPersistedData, DataGridPersistedFilterList, DataGridPersistedSort, DataGridPersistedSortList, DataGridPersistentState, DataGridPersistentStateLegacy, } from "./PersistFormat";
/**
 * What a persistence provider hands the grids inside it
 * (DataGridPersistentStateContext): the persisted data and its setter
 */
export type DataGridPersistentStateContextType = [
    /**
     * The persisted data, in whichever format it was written: what the setter
     * got last, or what was stored before. undefined: nothing is stored.
     *
     * A grid reads it when it mounts only: data handed out later (a load that
     * finishes after the grid opened) does not reach that grid. A provider
     * that loads the data asynchronously says that it is loading through
     * DataGridPersistMountContext, which holds the grids back until then.
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
     *
     * The data is a new object of JSON values, the JSON form of the grid's
     * state (a Date in the custom data is its ISO string, an undefined value
     * is left out), so a provider that hands it out hands out what its
     * storage gives back after a reload. It is the whole state: the parts the
     * grid persists (DataGridProps.persist), and the others as the provider
     * handed them out (legacy data in the current format; nothing of data in
     * a newer format).
     *
     * While the state has no JSON form (a BigInt, or an object that refers
     * back to itself, in the custom data or in a part the provider handed
     * out), the grid does not call the setter: it logs that to the console and
     * reports it (captureError, source "DataGrid.persist"), once per error,
     * and calls the setter again once the state has a JSON form.
     *
     * Throw, or return a promise which rejects, when the data could not be
     * stored. The grid logs the error to the console and calls the setter
     * again with its next state update (a page of rows loaded, a selection,
     * a change), with its current data, changed or not. The grid does not
     * wait for a returned promise before it calls the setter with a change.
     */
    (data: DataGridPersistentState) => Promise<void> | void
];
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
export declare const DataGridPersistentStateContext: React.Context<DataGridPersistentStateContextType | undefined>;
declare const _default: React.MemoExoticComponent<() => React.JSX.Element>;
export default _default;
