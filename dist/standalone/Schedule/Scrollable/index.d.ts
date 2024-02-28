import React from "react";
import { IDayData, ScheduleAction, ScheduleFilterDefinition } from "../Common/DayContents";
/**
 * Callback to load week data from a data source
 * @param weekOffset The week relative to the current week of year
 * 					 Example: -1 for last week, 0 for this week, 1 for next week
 * @param filter The filter selected by the user
 * @returns A promise containing the data for the days of the week, may throw an
 * 			error. Format: IDayData[weekday starting Monday][n]
 */
export type LoadWeekCallback = (weekOffset: number, filters: Record<string, string | boolean>) => IDayData[][] | Promise<IDayData[][]>;
export interface ScrollableScheduleProps {
    /**
     * CSS Class which specifies the infinite scroll height
     */
    wrapperClass: string;
    /**
     * The callback to load data for a week
     */
    loadWeekCallback: LoadWeekCallback;
    /**
     * Optional filter
     */
    filters?: Record<string, ScheduleFilterDefinition>;
    /**
     * Optional actions
     */
    actions?: ScheduleAction[];
}
/**
 * Outdated alias
 * @deprecated use ScrollableScheduleProps
 */
export type IProps = ScrollableScheduleProps;
declare const _default: React.MemoExoticComponent<(props: ScrollableScheduleProps) => React.JSX.Element>;
export default _default;
