import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useId, useLayoutEffect, useMemo, useRef, useState, } from "react";
import { styled } from "@mui/material";
import { DataGridPersistentStateContext, } from "./StatePersistence";
import { mergePersistedState, splitPersistedState } from "./PersistFormat";
import { StorageManager } from "../../framework/Storage";
import useAsyncMemo from "../../utils/useAsyncMemo";
import Loader from "../Loader";
import { DataGridFocusHandoffContext, } from "./FocusHandoff";
const DATA_GRID_STORAGE_KEY_BASE = "data-grid-";
/**
 * The Loader shown while the buckets load. It takes keyboard focus from a
 * grid that it replaces, and shows the library's focus ring then, inside its
 * edge because an ancestor may clip it.
 */
const FocusableLoader = styled(Loader)(({ theme }) => ({
    "&:focus-visible": {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: -2,
    },
}));
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
 *
 * A bucket is only written when its part of the state differs from what it
 * holds, as read or last written: a column resize writes the sizing bucket
 * alone, the search the filters bucket alone. A bucket which cannot be
 * written (the storage throws or rejects) does not keep the other one from
 * being written. The setter then rejects, once both writes are done, with an
 * error naming the bucket (an AggregateError of both when both failed); the
 * grid logs it and hands its data over again with its next state update,
 * which writes the failed bucket again.
 *
 * When the storage keys change, a Loader replaces the children until both
 * buckets are loaded for the new keys, and the children mount again then.
 * Keyboard focus in a grid inside moves to the Loader meanwhile, and then to
 * the same control of the grid mounted again (to its first control, if that
 * one is not there), unless focus was moved elsewhere in between.
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
    // factory never rejects (a bucket that cannot be read is reported in
    // `unreadable`), so there is no error to show.
    const { value: data } = useAsyncMemo(async () => {
        const unreadable = [];
        // what each bucket which could be read holds
        const read = new Map();
        const resultObjects = await Promise.all([DATA_GRID_STORAGE_KEY_COLUMN_SIZING, DATA_GRID_STORAGE_KEY_FILTERS].map(async (storageKey) => {
            let dataStr;
            try {
                dataStr = await StorageManager.getItem(storageKey, storageKeys);
                read.set(storageKey, dataStr);
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
        return [mergePersistedState(resultObjects), unreadable, read];
    }, [storageKeysJson]);
    const unreadable = data?.[1];
    const read = data?.[2];
    // per bucket, what it holds as far as this provider knows: what was read,
    // then what was written last. Kept per read, so other storage keys, and
    // storage keys read again, start from what is stored for them.
    const stored = useRef(null);
    const setData = useCallback(async (data) => {
        setWritten([storageKeysJson, data]);
        if (!stored.current || stored.current[0] !== read)
            stored.current = [read, new Map(read)];
        const values = stored.current[1];
        const [sizing, rest] = splitPersistedState(data);
        const write = async (storageKey, part) => {
            // writing a bucket which could not be read would replace what is
            // stored in it with what the grid opened with instead
            if (unreadable?.includes(storageKey))
                return;
            const value = JSON.stringify(part);
            // a change is mostly to one bucket: a resize, a filter, the search
            if (values.get(storageKey) === value)
                return;
            values.set(storageKey, value);
            try {
                await StorageManager.setItem(storageKey, storageKeys, value);
            }
            catch (e) {
                // what the bucket holds is unknown now, the next call writes it
                if (values.get(storageKey) === value)
                    values.delete(storageKey);
                throw new Error("Failed writing DataGrid config to StorageManager." +
                    storageKey +
                    " " +
                    storageKeysJson, { cause: e });
            }
        };
        // one bucket which cannot be written does not keep the other from
        // being written, and the caller hears of each that failed
        const failures = (await Promise.allSettled([
            write(DATA_GRID_STORAGE_KEY_COLUMN_SIZING, sizing),
            write(DATA_GRID_STORAGE_KEY_FILTERS, rest),
        ])).flatMap((result) => result.status === "rejected" ? [result.reason] : []);
        if (failures.length > 1)
            throw new AggregateError(failures, "Failed writing DataGrid config to StorageManager");
        if (failures.length > 0)
            throw failures[0];
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storageKeysJson, unreadable, read]);
    // where focus was in a grid that the Loader replaced, until the grid
    // mounted in its place takes it over (see DataGridFocusHandoffContext)
    const focusHandoff = useRef(null);
    // the children are mounted anew for each load
    const focusCtx = useMemo(() => ({
        handoff: focusHandoff,
        mount: data,
    }), [data]);
    const loaderId = useId();
    // layout effects of the children run first: a grid that unmounted for the
    // Loader has handed focus over, a grid that mounted in place of the Loader
    // has taken it
    useLayoutEffect(() => {
        if (!focusHandoff.current)
            return;
        // loaded, or the keys changed while the children are mounted: what is
        // left (no grid mounted, a grid the app unmounted) is for no later grid
        if (data) {
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
    }, [data, storageKeysJson, loaderId]);
    const handleLoaderBlur = useCallback((evt) => {
        const loader = evt.currentTarget;
        // once the update is done: the Loader is removed when the buckets are
        // loaded, and the grid takes focus. Focus moved elsewhere (not the
        // window losing focus) stays there.
        queueMicrotask(() => {
            if (loader.isConnected && loader.ownerDocument.activeElement !== loader)
                focusHandoff.current = null;
        });
    }, []);
    const persistCtx = useMemo(() => [
        written?.[0] === storageKeysJson ? written[1] : data?.[0],
        setData,
    ], [written, storageKeysJson, data, setData]);
    return (_jsx(DataGridFocusHandoffContext.Provider, { value: focusCtx, children: data ? (_jsx(DataGridPersistentStateContext.Provider, { value: persistCtx, children: children })) : (_jsx(FocusableLoader, { id: loaderId, tabIndex: -1, onBlur: handleLoaderBlur })) }));
};
export default React.memo(StorageManagerPersist);
