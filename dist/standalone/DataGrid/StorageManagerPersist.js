import React, { useCallback, useMemo } from "react";
import { DataGridPersistentStateContext, } from "./StatePersistence";
import { StorageManager } from "../../framework/Storage";
const DATA_GRID_STORAGE_KEY_BASE = "data-grid-";
// recommended default: localStorage
export const DATA_GRID_STORAGE_KEY_COLUMN_SIZING = DATA_GRID_STORAGE_KEY_BASE + "column-sizing";
// recommended default: server storage
export const DATA_GRID_STORAGE_KEY_FILTERS = DATA_GRID_STORAGE_KEY_BASE + "filters";
/**
 * A persistence provider for DataGrid.
 * Uses storage manager for storage.
 * Wrap around DataGrid component to archive persistence
 */
const StorageManagerPersist = (props) => {
    const { storageKeys, children } = props;
    const setData = useCallback(async (data) => {
        const { columnWidth, ...otherData } = data;
        const { initialResize, ...otherState } = otherData.state;
        await Promise.all([
            StorageManager.setItem(DATA_GRID_STORAGE_KEY_COLUMN_SIZING, storageKeys, JSON.stringify({
                columnWidth,
                state: {
                    initialResize,
                },
            })),
            StorageManager.setItem(DATA_GRID_STORAGE_KEY_FILTERS, storageKeys, JSON.stringify({
                ...otherData,
                state: {
                    ...otherState,
                },
            })),
        ]);
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(storageKeys)]);
    const persistCtx = useMemo(() => {
        const data = (async () => {
            const resultObjects = await Promise.all([
                DATA_GRID_STORAGE_KEY_COLUMN_SIZING,
                DATA_GRID_STORAGE_KEY_FILTERS,
            ].map(async (storageKey) => {
                const dataStr = await StorageManager.getItem(storageKey, storageKeys);
                if (dataStr) {
                    try {
                        return JSON.parse(dataStr);
                    }
                    catch (e) {
                        // eslint-disable-next-line no-console
                        console.error("[Components-Care] Failed parsing DataGrid config from StorageManager." +
                            storageKey, storageKeys, "Removing from server");
                        return StorageManager.setItem(storageKey, storageKeys, null);
                    }
                }
            }));
            return resultObjects.reduce((prev, next) => Object.assign(prev, next), {});
        })();
        return [data, setData];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setData, JSON.stringify(storageKeys)]);
    return (React.createElement(DataGridPersistentStateContext.Provider, { value: persistCtx }, children));
};
export default React.memo(StorageManagerPersist);
