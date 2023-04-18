import React from "react";
import { IDayData, ScheduleFilterDefinition } from "../Common/DayContents";
/**
 * Callback to load week data from a data source
 * @param weekOffset The week relative to the current week of year
 * 					 Example: -1 for last week, 0 for this week, 1 for next week
 * @param filter The filter selected by the user
 * @returns A promise containing the data for the days of the week, may throw an
 * 			error. Format: IDayData[weekday starting Monday][n]
 */
export declare type LoadWeekCallback = (weekOffset: number, filter: string | null) => IDayData[][] | Promise<IDayData[][]>;
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
    filter?: ScheduleFilterDefinition;
}
/**
 * Outdated alias
 * @deprecated use ScrollableScheduleProps
 */
export declare type IProps = ScrollableScheduleProps;
declare const _default: React.MemoExoticComponent<(props: ScrollableScheduleProps) => JSX.Element>;
export default _default;
