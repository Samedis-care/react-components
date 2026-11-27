import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useContext, useId, useLayoutEffect, useMemo, useRef, } from "react";
import { styled } from "@mui/material";
import Loader from "../Loader";
import { DataGridFocusHandoffContext, } from "./FocusHandoff";
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
export const DataGridPersistMountContext = React.createContext(null);
/**
 * The Loader shown in the grid's place while the stored state loads. It
 * grows like the grid's root does. It takes keyboard focus from a grid that
 * it replaces, and shows the library's focus ring then, inside its edge
 * because an ancestor may clip it.
 */
const FocusableLoader = styled(Loader)(({ theme }) => ({
    flexGrow: 1,
    "&:focus-visible": {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: -2,
    },
}));
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
export const withDataGridPersistGate = (Grid) => {
    const DataGridPersistGate = (props, ref) => {
        const persistMount = useContext(DataGridPersistMountContext);
        const inProvider = persistMount != null;
        const loading = persistMount?.loading ?? false;
        const mount = persistMount?.mount;
        // where focus was in the grid when it unmounted for other storage keys,
        // until the grid mounted again takes it over
        const focusHandoff = useRef(null);
        const focusCtx = useMemo(() => inProvider ? { handoff: focusHandoff, mount } : null, [inProvider, mount]);
        const loaderId = useId();
        // layout effects of the grid run first: a grid that unmounted for the
        // Loader has handed focus over, a grid that mounted in place of the
        // Loader has taken it
        useLayoutEffect(() => {
            if (!focusHandoff.current)
                return;
            // the grid is mounted: what is left is for no later grid
            if (!loading) {
                focusHandoff.current = null;
                return;
            }
            const loader = document.getElementById(loaderId);
            const active = document.activeElement;
            // the Loader keeps it while the keys change again
            if (loader && active === loader)
                return;
            // focus that is elsewhere already stays there
            if (loader && (!active || active === document.body))
                loader.focus();
            else
                focusHandoff.current = null;
        }, [loading, mount, loaderId]);
        const handleLoaderBlur = useCallback((evt) => {
            const loader = evt.currentTarget;
            // once the update is done: the Loader is removed when the state is
            // loaded, and the grid takes focus. Focus moved elsewhere (not the
            // window losing focus) stays there.
            queueMicrotask(() => {
                if (loader.isConnected &&
                    loader.ownerDocument.activeElement !== loader)
                    focusHandoff.current = null;
            });
        }, []);
        return (_jsx(DataGridFocusHandoffContext.Provider, { value: focusCtx, children: loading ? (_jsx(FocusableLoader, { id: loaderId, tabIndex: -1, onBlur: handleLoaderBlur })) : ref ? (_jsx(Grid, { ...props, ref: ref }, mount)) : (_jsx(Grid, { ...props }, mount)) }));
    };
    return React.forwardRef(DataGridPersistGate);
};
