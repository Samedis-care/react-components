import React from "react";
import { IDayData, ScheduleFilterDefinition } from "../Common/DayContents";
export interface WeekViewProps {
    /**
     * Callback to load data of this week
     * @param weekOffset The offset to the current week
     * @param filter The selected filter
     */
    loadData: (weekOffset: number, filter: string | null) => IDayData[][] | Promise<IDayData[][]>;
    /**
     * Optional filter
     */
    filter?: ScheduleFilterDefinition;
}
declare const _default: React.MemoExoticComponent<(props: WeekViewProps) => JSX.Element>;
export default _default;
