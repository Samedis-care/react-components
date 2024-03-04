import React from "react";
import { ClassNameMap } from "@mui/styles/withStyles";
import { Theme } from "@mui/material";
import type { SignalPortletColorConfig } from "./index";
import { Styles } from "@mui/styles";
export interface SignalPortletItemDef {
    /**
     * The count to show or null/undefined to signal loading
     */
    count: number | null | undefined;
    /**
     * The text of the portlet item
     */
    text: React.ReactNode;
    /**
     * The url the portlet item links to onClick
     */
    link?: string;
    /**
     * Custom CSS styles
     */
    classes?: Partial<ClassNameMap<keyof ReturnType<typeof useStyles>>>;
}
export type SignalPortletItemProps = SignalPortletItemDef & SignalPortletColorConfig;
declare const useStyles: (props: SignalPortletItemProps) => ClassNameMap<"root" | "itemColorLoading" | "itemColorActive" | "itemColorInactive" | "listAvatar" | "listText" | "listTextPrimary">;
export type SignalPortletItemClassKey = keyof ReturnType<typeof useStyles>;
export type SignalPortletItemTheme = Partial<Styles<Theme, SignalPortletItemProps, SignalPortletItemClassKey>>;
declare const _default: React.MemoExoticComponent<(props: SignalPortletItemProps) => React.JSX.Element>;
export default _default;
