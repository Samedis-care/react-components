import React, { useCallback, useMemo } from "react";
import { DataGridPersistentStateContext, } from "./StatePersistence";
/**
 * A persistence provider for DataGrid.
 * Uses localStorage for storage.
 * Wrap around DataGrid component to archive persistence
 */
var LocalStoragePersist = function (props) {
    var storageKey = props.storageKey, children = props.children;
    var setData = useCallback(function (data) {
        try {
            localStorage === null || localStorage === void 0 ? void 0 : localStorage.setItem(storageKey, JSON.stringify(data));
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.error("[Components-Care] Failed to persist DataGrid config in localStorage." +
                storageKey, e);
        }
    }, [storageKey]);
    var persistCtx = useMemo(function () {
        var dataStr = localStorage === null || localStorage === void 0 ? void 0 : localStorage.getItem(storageKey);
        var data;
        if (dataStr) {
            try {
                data = JSON.parse(dataStr);
            }
            catch (e) {
                // eslint-disable-next-line no-console
                console.error("[Components-Care] Failed parsing DataGrid config from localStorage." +
                    storageKey, "Removing from localStorage");
                localStorage === null || localStorage === void 0 ? void 0 : localStorage.removeItem(storageKey);
            }
        }
        return [data, setData];
    }, [setData, storageKey]);
    return (React.createElement(DataGridPersistentStateContext.Provider, { value: persistCtx }, children));
};
export default React.memo(LocalStoragePersist);
