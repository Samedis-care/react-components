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
     * When the shown data was produced, as a Date or in milliseconds since the
     * epoch (e.g. `Date.now()`). Shows "Last refresh: <age>" in the footer, with
     * the date and time in a tooltip. The age advances while the card stays
     * mounted.
     *
     * `null`, `undefined`, an invalid time (`NaN`, `new Date("garbage")`) and 0
     * (the epoch, also as `new Date(0)`, which is what `new Date(null)` gives)
     * hide the label. So react-query's `dataUpdatedAt`, 0 until the first
     * successful fetch, can be passed as it is.
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
