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
 *
 * A bucket that cannot be read (the storage throws or rejects) is logged, and
 * the children render with that bucket's part at the grid defaults. That
 * bucket is not written for these storage keys, so what is stored there is
 * not replaced by the defaults; it is read again when the storage keys change
 * or the provider mounts again. A bucket that does not parse is deleted.
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
    // wrapped in a tuple so "loaded, but nothing stored" stays distinguishable
    // from "still loading" (useAsyncMemo yields null while it runs). The
    // factory never rejects, a rejection would keep the Loader up for good.
    const data = useAsyncMemo(async () => {
        const unreadable = [];
        const resultObjects = await Promise.all([DATA_GRID_STORAGE_KEY_COLUMN_SIZING, DATA_GRID_STORAGE_KEY_FILTERS].map(async (storageKey) => {
            let dataStr;
            try {
                dataStr = await StorageManager.getItem(storageKey, storageKeys);
            }
            catch (e) {
                // eslint-disable-next-line no-console
                console.error("[Components-Care] Failed reading DataGrid config from StorageManager." +
                    storageKey, storageKeys, "Not writing it for these storage keys", e);
                unreadable.push(storageKey);
                return undefined;
            }
            if (dataStr) {
                try {
                    return JSON.parse(dataStr);
                }
                catch (e) {
                    // eslint-disable-next-line no-console
                    console.error("[Components-Care] Failed parsing DataGrid config from StorageManager." +
                        storageKey, storageKeys, "Removing from server", e);
                    // deleted without waiting for it, the grids can open meanwhile
                    Promise.resolve()
                        .then(() => StorageManager.setItem(storageKey, storageKeys, null))
                        .catch((deleteError) => {
                        // eslint-disable-next-line no-console
                        console.error("[Components-Care] Failed removing DataGrid config from StorageManager." +
                            storageKey, storageKeys, deleteError);
                    });
                    return undefined;
                }
            }
        }));
        return [mergePersistedState(resultObjects), unreadable];
    }, [storageKeysJson]);
    const unreadable = data?.[1];
    const setData = useCallback(async (data) => {
        setWritten([storageKeysJson, data]);
        const [sizing, rest] = splitPersistedState(data);
        // writing a bucket which could not be read would replace what is
        // stored in it with what the grid opened with instead
        const write = (storageKey, part) => unreadable?.includes(storageKey)
            ? undefined
            : StorageManager.setItem(storageKey, storageKeys, JSON.stringify(part));
        await Promise.all([
            Promise.resolve(write(DATA_GRID_STORAGE_KEY_COLUMN_SIZING, sizing)),
            Promise.resolve(write(DATA_GRID_STORAGE_KEY_FILTERS, rest)),
        ]);
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storageKeysJson, unreadable]);
    const persistCtx = useMemo(() => [
        written?.[0] === storageKeysJson ? written[1] : data?.[0],
        setData,
    ], [written, storageKeysJson, data, setData]);
    if (!data)
        return _jsx(Loader, {});
    return (_jsx(DataGridPersistentStateContext.Provider, { value: persistCtx, children: children }));
};
export default React.memo(StorageManagerPersist);
