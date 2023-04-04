import React from "react";
import { ClassNameMap } from "@material-ui/styles/withStyles";
import { SignalPortletColorConfig } from "./index";
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
export declare type SignalPortletItemProps = SignalPortletItemDef & SignalPortletColorConfig;
declare const useStyles: (props: SignalPortletItemProps) => ClassNameMap<"root" | "itemColorLoading" | "itemColorActive" | "itemColorInactive" | "listAvatar" | "listText">;
declare const _default: React.MemoExoticComponent<(props: SignalPortletItemProps) => JSX.Element>;
export default _default;
