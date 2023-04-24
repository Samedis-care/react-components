import React from "react";
import { IDayData, ScheduleFilterDefinition } from "../Common/DayContents";
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
}
declare const _default: React.MemoExoticComponent<(props: WeekViewProps) => JSX.Element>;
export default _default;
