import React from "react";
/**
 * Props of {@link RoutedTabPanelWrapper}
 */
export interface RoutedTabPanelWrapperProps {
    /**
     * The panels: the entries made with `tab(name, element)` from
     * `useRoutedTabPanel`, any number of them, as JSX children or as an
     * array. `false`, `null` and `undefined` are skipped, so a conditional
     * panel is `{isAdmin && tab("sync", <Sync />)}`, and the entries of a
     * fragment take its place, as in `Routes`.
     */
    children: React.ReactNode;
    /**
     * CSS class of the panel element, after the theme's.
     */
    className?: string;
    /**
     * What the panel shows while its content suspends (a `React.lazy`
     * component, a `useTranslation` namespace that has not loaded yet, a
     * suspending query): the fallback of the Suspense boundary that the
     * wrapper renders inside the tabpanel. The tab bar, the tab that opened
     * the panel and its focus stay meanwhile, and the tabpanel is
     * `aria-busy="true"`. A panel that suspends again after it has shown
     * (a later suspending render) is hidden and shows the fallback too.
     *
     * Default: a `Loader`, a polite status (`role="status"`) whose spinner is
     * named "Loading…" in the library's language. It is `aria-busy="false"`,
     * so that a screen reader that holds back the changes of the busy panel
     * still announces it. `null` shows nothing (the panel is still
     * `aria-busy`). A Suspense boundary inside the panel element catches its
     * content first.
     */
    fallback?: React.ReactNode;
}
export type RoutedTabPanelWrapperClassKey = "root";
declare const _default: React.MemoExoticComponent<(inProps: RoutedTabPanelWrapperProps) => React.JSX.Element | null>;
export default _default;
