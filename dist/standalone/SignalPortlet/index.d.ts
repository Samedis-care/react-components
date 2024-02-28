import React, { CSSProperties } from "react";
import { SignalPortletItemDef } from "./SignalPortletItem";
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
     * Custom CSS classes
     */
    classes?: Partial<Record<SignalPortletClassKey, string>>;
}
export type SignalPortletClassKey = "paper" | "divider" | "titleWrapper" | "title" | "list";
declare const _default: React.MemoExoticComponent<(inProps: SignalPortletProps) => JSX.Element>;
export default _default;
