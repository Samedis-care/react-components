import React from "react";
import { TabsProps } from "@mui/material";
/**
 * The name of the tablist (`role="tablist"`), which every `RoutedTabs` needs:
 * screen readers announce it when they enter the bar and list it among the
 * page's widgets, so it says what the tabs switch between. Pass
 * `aria-label`, `aria-labelledby`, or both; a bar without either does not
 * compile.
 */
export type RoutedTabsNameProps = {
    /**
     * The tablist's name: a translated text that says what the tabs switch
     * between, e.g. "User details" for a user's Main, Roles and Permissions
     * tabs. Set on the `role="tablist"` element. Required unless
     * `aria-labelledby` is set, which takes precedence when both are.
     */
    "aria-label": string;
    /**
     * The id of the element that names the tablist, such as a visible
     * heading above the bar, or several ids separated by spaces. Set on the
     * `role="tablist"` element. Takes precedence over `aria-label`.
     * Default: none, the tablist is named by `aria-label`.
     */
    "aria-labelledby"?: string;
} | {
    /**
     * The tablist's name: a translated text that says what the tabs switch
     * between. Optional next to `aria-labelledby`, which takes precedence:
     * screen readers then ignore it. Default: none.
     */
    "aria-label"?: string;
    /**
     * The id of the element that names the tablist, such as a visible
     * heading above the bar (the record's title above a record form's tabs),
     * or several ids separated by spaces. Set on the `role="tablist"`
     * element. Required unless `aria-label` is set.
     */
    "aria-labelledby": string;
};
/**
 * The props of {@link RoutedTabs} besides its name ({@link RoutedTabsNameProps}):
 * MUI's `TabsProps` without `value` and `onChange`, which come from the URL.
 * To derive a wrapper's props, extend this interface and intersect the result
 * with `RoutedTabsNameProps`, or use `DistributiveOmit<RoutedTabsProps, …>`.
 */
export interface RoutedTabsBaseProps extends Omit<TabsProps, "value" | "onChange" | "aria-label" | "aria-labelledby"> {
    /**
     * The MUI `Tab` elements. Each Tab's `value` is one path segment, a string
     * without "/", equal to the `name` of its panel in
     * `useRoutedTabPanel()(name, element)`. The selected Tab is the one whose
     * `value` is the first path segment after the enclosing Route's url, read
     * as the panels' Routes read it, so the Tab whose panel is shown is the one
     * selected: percent-decoded and case-insensitive (`/settings/Security` and
     * `/settings/my%20tab` select the Tabs `"security"` and `"my tab"`), and a
     * "//" counts as one "/". The Tab with
     * `value=""` is the default tab: it is selected at the route's own url,
     * and also when no Tab has the segment (a stale link, a Tab that is not
     * rendered, a path inside the default panel). Without a default tab, no
     * tab is selected then. Opening a Tab navigates to the route's url
     * followed by its value (`/settings/security`); the default tab navigates
     * to the route's own url (`/settings`, without a trailing "/").
     *
     * In development, a Tab whose value is not one path segment logs a warning
     * (once per bar and Tab): a value with "/", which is never selected, and a
     * value that is not a string, such as the index MUI gives a Tab without
     * `value`.
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
/**
 * The props of {@link RoutedTabs}: {@link RoutedTabsBaseProps} and the
 * tablist's name, `aria-label` or `aria-labelledby` (required, see
 * {@link RoutedTabsNameProps}). A union, so an interface cannot extend it, and
 * a plain `Omit` of it loses the requirement: use `DistributiveOmit`.
 */
export type RoutedTabsProps = RoutedTabsBaseProps & RoutedTabsNameProps;
export type RoutedTabsClassKey = "root";
declare const _default: React.MemoExoticComponent<(inProps: RoutedTabsProps) => React.JSX.Element>;
export default _default;
