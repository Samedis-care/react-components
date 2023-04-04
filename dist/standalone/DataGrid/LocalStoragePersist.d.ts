import React from "react";
export interface LocalStoragePersistProps {
    /**
     * The local storage key to use for persisting
     */
    storageKey: string;
    /**
     * The children to render
     */
    children: React.ReactNode;
}
declare const _default: React.MemoExoticComponent<(props: LocalStoragePersistProps) => JSX.Element>;
export default _default;
