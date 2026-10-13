import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useMemo, useState } from "react";
import { DataGridPersistentStateContext, } from "./StatePersistence";
import { mergePersistedState, splitPersistedState } from "./PersistFormat";
import { StorageManager } from "../../framework/Storage";
import useAsyncMemo from "../../utils/useAsyncMemo";
import Loader from "../Loader";
const DATA_GRID_STORAGE_KEY_BASE = "data-grid-";
// recommended default: localStorage
export const DATA_GRID_STORAGE_KEY_COLUMN_SIZING = DATA_GRID_STORAGE_KEY_BASE + "column-sizing";
// recommended default: server storage
export const DATA_GRID_STORAGE_KEY_FILTERS = DATA_GRID_STORAGE_KEY_BASE + "filters";
/**
 * A persistence provider for DataGrid.
 * Uses storage manager for storage.
 * Wrap around DataGrid component to archive persistence
 * @remarks The data it provides is what was written last, so a grid mounted
 *          later (or anything else reading the context) starts from the
 *          current state, not from the state loaded on mount
 */
const StorageManagerPersist = (props) => {
    const { storageKeys, children } = props;
    const storageKeysJson = JSON.stringify(storageKeys);
    // the storage is only read once per storage keys, so what was written since
    // is kept here, together with the keys it was written for
    const [written, setWritten] = useState(null);
    const setData = useCallback(async (data) => {
        setWritten([storageKeysJson, data]);
        const [sizing, rest] = splitPersistedState(data);
        await Promise.all([
            Promise.resolve(StorageManager.setItem(DATA_GRID_STORAGE_KEY_COLUMN_SIZING, storageKeys, JSON.stringify(sizing))),
            Promise.resolve(StorageManager.setItem(DATA_GRID_STORAGE_KEY_FILTERS, storageKeys, JSON.stringify(rest))),
        ]);
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storageKeysJson]);
    // wrapped in a tuple so "loaded, but nothing stored" stays distinguishable
    // from "still loading" (useAsyncMemo yields null while it runs)
    const data = useAsyncMemo(async () => {
        const resultObjects = await Promise.all([DATA_GRID_STORAGE_KEY_COLUMN_SIZING, DATA_GRID_STORAGE_KEY_FILTERS].map(async (storageKey) => {
            const dataStr = await StorageManager.getItem(storageKey, storageKeys);
            if (dataStr) {
                try {
                    return JSON.parse(dataStr);
                }
                catch (e) {
                    // eslint-disable-next-line no-console
                    console.error("[Components-Care] Failed parsing DataGrid config from StorageManager." +
                        storageKey, storageKeys, "Removing from server", e);
                    await StorageManager.setItem(storageKey, storageKeys, null);
                    return undefined;
                }
            }
        }));
        return [mergePersistedState(resultObjects)];
    }, [storageKeysJson]);
    const persistCtx = useMemo(() => [
        written?.[0] === storageKeysJson ? written[1] : data?.[0],
        setData,
    ], [written, storageKeysJson, data, setData]);
    if (!data)
        return _jsx(Loader, {});
    return (_jsx(DataGridPersistentStateContext.Provider, { value: persistCtx, children: children }));
};
export default React.memo(StorageManagerPersist);
