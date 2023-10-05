import React, { CSSProperties } from "react";
import { SignalPortletItemDef } from "./SignalPortletItem";
import { ClassNameMap } from "@mui/styles/withStyles";
import { Theme } from "@mui/material";
import { Styles } from "@mui/styles";
export interface SignalPortletColorConfig {
    /**
     * Color used for counter if count != 0
     */
    colorPresent: NonNullable<CSSProperties["color"]>;
    /**
     * Color used for counter if count == 0
     */
    colorNotPresent: NonNullable<CSSProperties["color"]>;
}
export interface SignalPortletProps extends SignalPortletColorConfig {
    /**
     * The title of the portlet
     */
    title: React.ReactNode;
    /**
     * The portlet items
     */
    items: SignalPortletItemDef[];
    /**
     * Custom CSS styles
     */
    classes?: Partial<ClassNameMap<keyof ReturnType<typeof useStyles>>>;
}
declare const useStyles: (props?: any) => ClassNameMap<"title" | "list" | "divider" | "paper" | "titleWrapper">;
export declare type SignalPortletClassKey = keyof ReturnType<typeof useStyles>;
export declare type SignalPortletTheme = Partial<Styles<Theme, SignalPortletProps, SignalPortletClassKey>>;
declare const _default: React.MemoExoticComponent<(props: SignalPortletProps) => JSX.Element>;
export default _default;
