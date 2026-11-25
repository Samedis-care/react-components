import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState, } from "react";
import { DataGridPersistentStateContext, } from "./StatePersistence";
import { DataGridFocusHandoffContext, } from "./FocusHandoff";
/**
 * A persistence provider for DataGrid.
 * Uses localStorage for storage.
 * Wrap around DataGrid component to archive persistence
 *
 * A change of storageKey mounts the children again, as a grid reads the
 * persisted state when it mounts only.
 *
 * If the browser blocks localStorage (blocked site data, some sandboxed
 * iframes), the grids open at their defaults and nothing is kept for the next
 * visit; the failed reads and writes are logged to the console.
 * @remarks The data it provides is what was written last, so a grid mounted
 *          later (or anything else reading the context) starts from the
 *          current state, not from the state loaded on mount
 */
const LocalStoragePersist = (props) => {
    const { storageKey, children } = props;
    // localStorage is only read once per storage key, so what was written since
    // is kept here, together with the key it was written for
    const [written, setWritten] = useState(null);
    const setData = useCallback((data) => {
        setWritten([storageKey, data]);
        try {
            localStorage?.setItem(storageKey, JSON.stringify(data));
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.error("[Components-Care] Failed to persist DataGrid config in localStorage." +
                storageKey, e);
        }
    }, [storageKey]);
    const stored = useMemo(() => {
        let dataStr;
        try {
            // reading window.localStorage throws, too, when the browser blocks it
            dataStr = localStorage?.getItem(storageKey);
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.error("[Components-Care] Failed reading DataGrid config from localStorage." +
                storageKey, e);
            return undefined;
        }
        let data;
        if (dataStr) {
            try {
                data = JSON.parse(dataStr);
            }
            catch (e) {
                // eslint-disable-next-line no-console
                console.error("[Components-Care] Failed parsing DataGrid config from localStorage." +
                    storageKey, "Removing from localStorage", e);
                try {
                    localStorage?.removeItem(storageKey);
                }
                catch (removeError) {
                    // eslint-disable-next-line no-console
                    console.error("[Components-Care] Failed removing DataGrid config from localStorage." +
                        storageKey, removeError);
                }
            }
        }
        return data;
    }, [storageKey]);
    // where focus was in a grid mounted for the previous key, until the grid
    // mounted for this one takes it over (see DataGridFocusHandoffContext)
    const focusHandoff = useRef(null);
    // the children are mounted anew for each key
    const focusCtx = useMemo(() => ({
        handoff: focusHandoff,
        mount: storageKey,
    }), [storageKey]);
    // layout effects of the children run first: the grids mounted for this key
    // have taken focus over; what is left had no grid to take it
    useLayoutEffect(() => {
        focusHandoff.current = null;
    }, [storageKey]);
    const persistCtx = useMemo(() => [
        written?.[0] === storageKey ? written[1] : stored,
        setData,
    ], [written, storageKey, stored, setData]);
    // a grid reads the persisted state when it mounts: one mounted for the
    // previous key would keep showing that key's state, and write it under
    // this one
    return (_jsx(DataGridFocusHandoffContext.Provider, { value: focusCtx, children: _jsx(DataGridPersistentStateContext.Provider, { value: persistCtx, children: _jsx(React.Fragment, { children: children }, storageKey) }) }));
};
export default React.memo(LocalStoragePersist);
