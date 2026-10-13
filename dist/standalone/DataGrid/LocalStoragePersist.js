import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useMemo, useState } from "react";
import { DataGridPersistentStateContext, } from "./StatePersistence";
/**
 * A persistence provider for DataGrid.
 * Uses localStorage for storage.
 * Wrap around DataGrid component to archive persistence
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
        const dataStr = localStorage?.getItem(storageKey);
        let data;
        if (dataStr) {
            try {
                data = JSON.parse(dataStr);
            }
            catch (e) {
                // eslint-disable-next-line no-console
                console.error("[Components-Care] Failed parsing DataGrid config from localStorage." +
                    storageKey, "Removing from localStorage", e);
                localStorage?.removeItem(storageKey);
            }
        }
        return data;
    }, [storageKey]);
    const persistCtx = useMemo(() => [
        written?.[0] === storageKey ? written[1] : stored,
        setData,
    ], [written, storageKey, stored, setData]);
    return (_jsx(DataGridPersistentStateContext.Provider, { value: persistCtx, children: children }));
};
export default React.memo(LocalStoragePersist);
