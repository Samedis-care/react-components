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
     * Updated at (optional)
     */
    updatedAt?: number | Date | null | undefined;
    /**
     * Refresh handler
     */
    onRefresh?: () => void;
    /**
     * Custom CSS classes
     */
    classes?: Partial<Record<SignalPortletClassKey, string>>;
    /**
     * Class name to apply to root
     */
    className?: string;
}
export type SignalPortletClassKey = "root" | "paper" | "divider" | "titleWrapper" | "title" | "list" | "item" | "refreshIconButton" | "refreshIcon" | "lastUpdatedAt" | "innerContainer";
declare const _default: React.MemoExoticComponent<(inProps: SignalPortletProps) => React.JSX.Element>;
export default _default;
