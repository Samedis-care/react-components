import React from "react";
import { TabsProps } from "@mui/material";
export interface RoutedTabsProps extends Omit<TabsProps, "value" | "onChange"> {
    children: React.ReactNode;
}
declare const _default: React.MemoExoticComponent<(props: RoutedTabsProps) => React.JSX.Element>;
export default _default;
