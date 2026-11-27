import React from "react";
/**
 * Props of DataGridLocalStoragePersist
 */
export interface LocalStoragePersistProps {
    /**
     * The localStorage key the grids inside read their state from and write it
     * to, used as it is. Grids with different DataGridProps.persist settings
     * keep each other's parts of the entry; grids that persist the same part
     * share it.
     *
     * localStorage belongs to the browser profile, not to the signed-in user:
     * include the user (and the tenant) in the key when several accounts may
     * use one browser, or the search and filters of one account show up for
     * the next.
     *
     * When it changes, the grids inside are mounted again, so they open with
     * what is stored under the new key. Everything else inside stays mounted
     * and keeps its state. Keyboard focus in a grid moves to the same control
     * of the grid mounted again (to its first control, if that one is not
     * there).
     */
    storageKey: string;
    /**
     * The children to render
     */
    children: React.ReactNode;
}
declare const _default: React.MemoExoticComponent<(props: LocalStoragePersistProps) => React.JSX.Element>;
export default _default;
