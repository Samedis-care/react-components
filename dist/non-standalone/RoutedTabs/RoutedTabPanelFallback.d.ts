import React from "react";
/**
 * Props of {@link RoutedTabPanelFallback}
 */
export interface RoutedTabPanelFallbackProps {
    /**
     * What the panel shows while its content suspends: the `fallback` of
     * `RoutedTabPanelWrapper`
     */
    children: React.ReactNode;
    /**
     * Called with `true` when the fallback appears and with `false` when it
     * goes, in a layout effect, so that the panel's `aria-busy` changes in the
     * same frame as the content
     */
    onShownChange: (shown: boolean) => void;
}
declare const _default: React.MemoExoticComponent<(props: RoutedTabPanelFallbackProps) => React.JSX.Element>;
export default _default;
