import React from "react";
import { TabsProps } from "@mui/material";
export interface RoutedTabsProps extends Omit<TabsProps, "value" | "onChange"> {
    /**
     * The MUI `Tab` elements. The selected Tab is the one whose `value` is the
     * first path segment after the enclosing Route's url. The Tab with
     * `value=""` is the default tab: it is selected at the route's own url,
     * and also when no Tab has the segment (a stale link, a Tab that is not
     * rendered, a path inside the default panel). Without a default tab, no
     * tab is selected then.
     *
     * Each Tab gets `disableFocusRipple` unless it sets the prop itself: a
     * keyboard-focused tab shows the focus ring, and MUI's pulsating focus
     * ripple would cover its label. A click still shows the ripple.
     *
     * Each Tab also gets an `id` and an `aria-controls` naming the panel that
     * `RoutedTabPanelWrapper` renders for its value, so a screen reader reads
     * the panel as the tab's ("Security tab panel"). A Tab that sets those
     * props itself has them replaced: the wrapper derives them from the route's
     * url and the value. See `linkTabsToPanels` for a bar without a wrapper.
     */
    children: React.ReactNode;
    /**
     * Whether a `RoutedTabPanelWrapper` under the same Route renders this bar's
     * panels. When `true` (the default) each Tab gets the `id` and
     * `aria-controls` of its panel. Set `false` for a bar that only navigates
     * (no panels, or panels not rendered by the wrapper): the Tabs then get
     * neither, so no `aria-controls` points at an element that does not exist.
     * The wrapper itself still gives its panel an `id` and `aria-labelledby`;
     * for a panel of your own, keep the default and set
     * `id={getTabPanelId(url, value)}` and
     * `aria-labelledby={getTabId(url, value)}` on it.
     */
    linkTabsToPanels?: boolean;
    /**
     * How the tabs share the bar. Default: `"scrollable"`, unlike MUI's
     * `Tabs`, so that every tab can be reached at any width (a phone, or 400%
     * zoom).
     * - `"scrollable"`: each tab as wide as its label, starting at the bar's
     *   start edge. When the tabs do not fit, the bar scrolls (swipe, the
     *   arrow keys, or the scroll buttons, see `scrollButtons` and
     *   `allowScrollButtonsMobile`).
     * - `"fullWidth"`: the tabs share the bar's width equally, as in MUI.
     *   A tab never gets narrower than its longest word: when the tabs do not
     *   fit, the bar scrolls like the `"scrollable"` one instead of cutting
     *   them off. A vertical bar keeps MUI's `fullWidth`.
     * - `"standard"`: MUI's fixed bar. It does not scroll, so tabs that do not
     *   fit are cut off and cannot be swiped into view: only for a bar that
     *   fits at 320px.
     *
     * A theme sets another default under `CcRoutedTabs.defaultProps`. This
     * component always passes `variant`, `centered` and
     * `allowScrollButtonsMobile` to MUI's `Tabs`, so the theme's
     * `MuiTabs.defaultProps` for those three do not reach it.
     */
    variant?: TabsProps["variant"];
    /**
     * Centers the tabs while they fit; when they do not, they start at the
     * bar's start edge, so the first one is not cut off. Works with every
     * variant, also with the default `"scrollable"` (MUI's own `centered` takes
     * effect only with `"standard"`). Default: `false`. The list has no
     * `MuiTabs-centered` class.
     */
    centered?: boolean;
    /**
     * Shows the scroll buttons of a scrolling bar on phones (below `sm`) too,
     * so that its tabs can be scrolled without swiping and it shows that more
     * tabs exist. Default: `true`, unlike MUI's `Tabs`. With
     * `scrollButtons="auto"` (MUI's default) they appear only while the tabs
     * do not fit; `scrollButtons={false}` hides them at every width.
     */
    allowScrollButtonsMobile?: boolean;
}
export type RoutedTabsClassKey = "root";
declare const _default: React.MemoExoticComponent<(inProps: RoutedTabsProps) => React.JSX.Element>;
export default _default;
