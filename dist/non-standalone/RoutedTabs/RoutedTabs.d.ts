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
     */
    children: React.ReactNode;
}
export type RoutedTabsClassKey = "root";
declare const _default: React.MemoExoticComponent<(props: RoutedTabsProps) => React.JSX.Element>;
export default _default;
