import React from "react";
import { TypographyProps } from "@mui/material";
export interface SignalPortletItemProps {
    /**
     * The count to show or null/undefined to signal loading
     */
    count: number | null | undefined;
    /**
     * The text of the portlet item
     */
    text: React.ReactNode;
    /**
     * Typography props
     */
    textTypographyProps?: TypographyProps;
    /**
     * The url the portlet item links to onClick
     */
    link?: string;
    /**
     * custom CSS classes to apply to root/rootBtn
     */
    className?: string;
    /**
     * Custom CSS styles
     */
    classes?: Partial<Record<SignalPortletItemClassKey, string>>;
}
export type SignalPortletItemClassKey = "listAvatar" | "itemColorLoading" | "itemColorActive" | "itemColorInactive" | "listText" | "root" | "rootBtn";
declare const _default: React.MemoExoticComponent<(inProps: SignalPortletItemProps) => React.JSX.Element>;
export default _default;
