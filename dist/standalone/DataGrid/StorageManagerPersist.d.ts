import React from "react";
export interface StorageManagerPersistProps {
    /**
     * The storage keys to use for persisting
     */
    storageKeys: Record<string, string>;
    /**
     * The children to render
     */
    children: React.ReactNode;
}
export declare const DATA_GRID_STORAGE_KEY_COLUMN_SIZING: string;
export declare const DATA_GRID_STORAGE_KEY_FILTERS: string;
declare const _default: React.MemoExoticComponent<(props: StorageManagerPersistProps) => JSX.Element>;
export default _default;
