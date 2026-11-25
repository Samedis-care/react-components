import React from "react";
export interface LocalStoragePersistProps {
    /**
     * The localStorage key the grids inside read their state from and write it
     * to.
     *
     * When it changes, the children are mounted again, so the grids open with
     * what is stored under the new key. Everything else inside is mounted
     * again as well and loses its state. Keyboard focus in a grid moves to
     * the same control of the grid mounted again (to its first control, if
     * that one is not there); focus elsewhere inside falls back to the page.
     */
    storageKey: string;
    /**
     * The children to render
     */
    children: React.ReactNode;
}
declare const _default: React.MemoExoticComponent<(props: LocalStoragePersistProps) => React.JSX.Element>;
export default _default;
