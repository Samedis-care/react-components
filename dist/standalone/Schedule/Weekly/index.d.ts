import React from "react";
import { IDayData, ScheduleAction, ScheduleFilterDefinition } from "../Common/DayContents";
export interface WeekViewProps {
    /**
     * Callback to load data of this week
     * @param weekOffset The offset to the current week
     * @param filter The selected filter(s)
     */
    loadData: (weekOffset: number, filter: Record<string, string | boolean>) => IDayData[][] | Promise<IDayData[][]>;
    /**
     * Optional filter
     */
    filters?: Record<string, ScheduleFilterDefinition>;
    /**
     * Buttons in the header. With at most one action and at most two filters,
     * the action renders inline on the right; otherwise all actions are listed,
     * in order, in the settings menu (gear button), after the filters it holds.
     * Default: no actions.
     */
    actions?: ScheduleAction[];
    /**
     * CSS class to apply to root
     */
    className?: string;
    /**
     * Custom CSS classes
     */
    classes?: Partial<Record<WeekViewClassKey, string>>;
}
export type WeekViewClassKey = "root" | "todayBtn" | "loadWrapper" | "filterWrapper" | "week" | "picker";
declare const _default: React.MemoExoticComponent<(inProps: WeekViewProps) => React.JSX.Element>;
export default _default;
