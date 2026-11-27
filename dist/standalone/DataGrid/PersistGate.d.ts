import React from "react";
import type { DataGridDispatch, DataGridProps } from "./DataGrid";
/**
 * What a persistence provider tells the grids inside it about the stored
 * state (DataGridPersistMountContext)
 */
export interface DataGridPersistMountContextType {
    /**
     * Whether the provider is still loading the stored state for its current
     * storage keys. The grids inside show a Loader in their place meanwhile,
     * and open with the stored state once it is loaded.
     */
    loading: boolean;
    /**
     * The provider's current storage keys, as one string (a custom provider:
     * its storage key). When it changes, the grids inside are mounted again,
     * so they open with the state stored under the new keys.
     */
    mount: string;
}
/**
 * Lets a persistence provider hold back the grids inside it, and only them,
 * while it loads the stored state, and mount them again when its storage
 * keys change: a grid reads the persisted state when it mounts only.
 *
 * DataGridLocalStoragePersist and DataGridStorageManagerPersist provide it.
 * A custom provider that loads its data asynchronously provides it next to
 * DataGridPersistentStateContext, as a memoized value: loading until the
 * data is there (DataGridPersistentStateContext may be undefined
 * meanwhile), and its storage key as mount. null (outside of a provider, and
 * below DataGridNoPersist): the grids open at once and stay mounted.
 * @remarks A custom provider inside another provider provides it too (null
 *          when it never loads), or its grids wait for the outer provider's
 *          load and are mounted again for the outer provider's keys.
 * @example
 * // in a custom provider which loads `stored` for `storageKey` in an effect
 * const mountCtx = useMemo(
 *   () => ({ loading: !loaded, mount: storageKey }),
 *   [loaded, storageKey],
 * );
 * const persistCtx = useMemo(
 *   () => (loaded ? [stored, save] : undefined),
 *   [loaded, stored, save],
 * );
 * return (
 *   <DataGridPersistMountContext.Provider value={mountCtx}>
 *     <DataGridPersistentStateContext.Provider value={persistCtx}>
 *       {children}
 *     </DataGridPersistentStateContext.Provider>
 *   </DataGridPersistMountContext.Provider>
 * );
 */
export declare const DataGridPersistMountContext: React.Context<DataGridPersistMountContextType | null>;
/**
 * The grid the gate wraps
 */
type GridComponent = React.ForwardRefExoticComponent<React.PropsWithoutRef<DataGridProps> & React.RefAttributes<DataGridDispatch>>;
/**
 * Wraps the grid in the gate of its persistence provider
 * (DataGridPersistMountContext). Outside of a provider the grid renders as
 * it is.
 *
 * Inside one, a Loader takes the grid's place while the provider loads the
 * stored state, and the grid is mounted anew for each of the provider's
 * storage keys. Keyboard focus in the grid moves to the Loader meanwhile,
 * and then to the same control of the grid mounted again (to its first
 * control, if that one is not there), unless focus was moved elsewhere in
 * between (see useDataGridFocusHandoff).
 * @param Grid The grid
 * @returns The grid in its gate
 */
export declare const withDataGridPersistGate: (Grid: GridComponent) => React.ForwardRefExoticComponent<DataGridProps & React.RefAttributes<DataGridDispatch>>;
export {};
