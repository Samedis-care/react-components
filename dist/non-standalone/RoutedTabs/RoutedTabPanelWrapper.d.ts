import React from "react";
/**
 * Props of {@link RoutedTabPanelWrapper}
 */
export interface RoutedTabPanelWrapperProps {
    /**
     * The panels: the entries made with `tab(name, element)` from
     * `useRoutedTabPanel`, any number of them, as JSX children or as an
     * array. `false`, `null` and `undefined` are skipped, so a conditional
     * panel is `{isAdmin && tab("sync", <Sync />)}`.
     */
    children: React.ReactNode;
    /**
     * CSS class of the panel element, after the theme's.
     */
    className?: string;
}
export type RoutedTabPanelWrapperClassKey = "root";
declare const _default: React.MemoExoticComponent<(inProps: RoutedTabPanelWrapperProps) => React.JSX.Element | null>;
export default _default;
