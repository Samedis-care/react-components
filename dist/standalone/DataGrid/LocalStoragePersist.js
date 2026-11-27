import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useMemo, useState } from "react";
import { DataGridPersistentStateContext, } from "./StatePersistence";
import { DataGridPersistMountContext, } from "./PersistGate";
/**
 * A persistence provider for DataGrid.
 * Uses localStorage for storage.
 * Wrap around DataGrid component to archive persistence
 *
 * A change of storageKey mounts the grids inside again, as a grid reads the
 * persisted state when it mounts only; the rest of the children stay
 * mounted.
 *
 * Other tabs are not followed: the entry is read when the provider mounts
 * and when storageKey changes, and a grid writes the parts it persists as it
 * has them. So the tab that writes last decides them, also those another
 * tab changed meanwhile.
 *
 * If the browser blocks localStorage (blocked site data, some sandboxed
 * iframes), the grids open at their defaults and nothing is kept for the next
 * visit; the failed reads and writes are logged to the console.
 * @remarks The data it provides is what was written last since the entry
 *          was read, so a grid mounted later (or anything else reading the
 *          context) starts from the current state, not from the state loaded
 *          on mount. A storage key that comes back is read again, and its
 *          grids start from what is stored under it then, not from what was
 *          written under it before.
 */
const LocalStoragePersist = (props) => {
    const { storageKey, children } = props;
    // localStorage is only read once per storage key, so what was written since
    // is kept here, together with the read it follows: a storage key read again
    // starts from what is stored under it then, which another tab may have
    // changed meanwhile
    const [written, setWritten] = useState(null);
    // read while rendering, once per storage key: each read is a new object,
    // which tells what was written since it from what was written before
    const read = useMemo(() => {
        let dataStr;
        try {
            // reading window.localStorage throws, too, when the browser blocks it
            dataStr = localStorage?.getItem(storageKey);
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.error("[Components-Care] Failed reading DataGrid config from localStorage." +
                storageKey, e);
            return { data: undefined };
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
        return { data };
    }, [storageKey]);
    const setData = useCallback((data) => {
        setWritten([read, data]);
        try {
            localStorage?.setItem(storageKey, JSON.stringify(data));
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.error("[Components-Care] Failed to persist DataGrid config in localStorage." +
                storageKey, e);
        }
    }, [storageKey, read]);
    // a grid reads the persisted state when it mounts: one mounted for the
    // previous key would keep showing that key's state, and write it under
    // this one, so the grids are mounted anew for each key
    const mountCtx = useMemo(() => ({
        loading: false,
        mount: storageKey,
    }), [storageKey]);
    const persistCtx = useMemo(() => [
        // what was written since this read of the entry, else what it holds
        written?.[0] === read ? written[1] : read.data,
        setData,
    ], [written, read, setData]);
    return (_jsx(DataGridPersistMountContext.Provider, { value: mountCtx, children: _jsx(DataGridPersistentStateContext.Provider, { value: persistCtx, children: children }) }));
};
export default React.memo(LocalStoragePersist);
