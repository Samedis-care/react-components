import React from "react";
/**
 * Props of DataGridStorageManagerPersist
 */
export interface StorageManagerPersistProps {
    /**
     * The storage keys to use for persisting. When they change (compared as
     * JSON), the grids inside are mounted again, with the state stored under
     * the new keys.
     *
     * The order of the keys is part of the key a bucket is stored under (see
     * GetStorageProviderCallback): `{ tenant, model }` and
     * `{ model, tenant }` are two different stored states. Build the object in
     * the same order everywhere.
     */
    storageKeys: Record<string, string>;
    /**
     * The children to render
     */
    children: React.ReactNode;
}
/**
 * The StorageManager id of the bucket in which DataGridStorageManagerPersist
 * keeps the column widths and whether their first auto-fit has run (the
 * sizing part of splitPersistedState).
 *
 * StorageManager.configure gets it as the id, to pick the storage of the
 * bucket and the keys it is stored under. Recommended: localStorage, so the
 * widths stay with the device; leave out the keys the widths should be shared
 * across (the tenant, say). Without a configure call, both buckets go to
 * localStorage.
 */
export declare const DATA_GRID_STORAGE_KEY_COLUMN_SIZING: string;
/**
 * The StorageManager id of the bucket in which DataGridStorageManagerPersist
 * keeps everything but the column widths: the columns seen, hidden and
 * pinned, the sort, the column filters, the search and the custom data (the
 * rest of splitPersistedState).
 *
 * StorageManager.configure gets it as the id, to pick the storage of the
 * bucket and the keys it is stored under. Recommended: server storage, so the
 * settings follow the user to other devices. Without a configure call, both
 * buckets go to localStorage.
 */
export declare const DATA_GRID_STORAGE_KEY_FILTERS: string;
declare const _default: React.MemoExoticComponent<(props: StorageManagerPersistProps) => React.JSX.Element>;
export default _default;
