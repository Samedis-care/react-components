import React from "react";
import { SignalPortletItemProps } from "./SignalPortletItem";
export interface SignalPortletProps {
    /**
     * The title of the portlet
     */
    title: React.ReactNode;
    /**
     * The portlet items
     */
    items: SignalPortletItemProps[];
    /**
     * Custom CSS classes
     */
    classes?: Partial<Record<SignalPortletClassKey, string>>;
}
export type SignalPortletClassKey = "paper" | "divider" | "titleWrapper" | "title" | "list" | "item";
declare const _default: React.MemoExoticComponent<(inProps: SignalPortletProps) => React.JSX.Element>;
export default _default;
