import React, { CSSProperties } from "react";
import { SignalPortletItemDef } from "./SignalPortletItem";
import { ClassNameMap } from "@material-ui/styles/withStyles";
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
declare const useStyles: (props?: any) => ClassNameMap<"title" | "list" | "paper" | "titleWrapper">;
declare const _default: React.MemoExoticComponent<(props: SignalPortletProps) => JSX.Element>;
export default _default;
