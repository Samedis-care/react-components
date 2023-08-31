import React, { useCallback, useMemo } from "react";
import { DataGridPersistentStateContext, } from "./StatePersistence";
/**
 * A persistence provider for DataGrid.
 * Uses localStorage for storage.
 * Wrap around DataGrid component to archive persistence
 */
const LocalStoragePersist = (props) => {
    const { storageKey, children } = props;
    const setData = useCallback((data) => {
        try {
            localStorage?.setItem(storageKey, JSON.stringify(data));
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.error("[Components-Care] Failed to persist DataGrid config in localStorage." +
                storageKey, e);
        }
    }, [storageKey]);
    const persistCtx = useMemo(() => {
        const dataStr = localStorage?.getItem(storageKey);
        let data;
        if (dataStr) {
            try {
                data = JSON.parse(dataStr);
            }
            catch (e) {
                // eslint-disable-next-line no-console
                console.error("[Components-Care] Failed parsing DataGrid config from localStorage." +
                    storageKey, "Removing from localStorage");
                localStorage?.removeItem(storageKey);
            }
        }
        return [data, setData];
    }, [setData, storageKey]);
    return (React.createElement(DataGridPersistentStateContext.Provider, { value: persistCtx }, children));
};
export default React.memo(LocalStoragePersist);
