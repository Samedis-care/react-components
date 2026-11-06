import React from "react";
import { IDayData, ScheduleAction, ScheduleFilterDefinition } from "../Common/DayContents";
/**
 * Callback to load week data from a data source
 *
 * ScrollableSchedule calls it for each week it adds to the list. When it is
 * passed a new function, it calls the new one for every week in the list; each
 * week keeps its rows until the new result arrives, and a result or error of
 * an earlier call that arrives later is ignored. Pass a function that changes
 * only when the data source does (`useCallback`): a new function on every
 * render reloads the list on every render.
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
     * The callback to load data for a week. A new function reloads the weeks in
     * the list (see LoadWeekCallback).
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
    /**
     * CSS class to apply to root
     */
    className?: string;
    /**
     * Custom CSS classes
     */
    classes?: Partial<Record<ScrollableScheduleClassKey, string>>;
}
/**
 * Outdated alias
 * @deprecated use ScrollableScheduleProps
 */
export type IProps = ScrollableScheduleProps;
export type ScrollableScheduleClassKey = "today" | "todayBtn" | "scroller" | "filterSettingsBtn" | "filterWrapper";
declare const _default: React.MemoExoticComponent<(inProps: ScrollableScheduleProps) => React.JSX.Element>;
export default _default;
