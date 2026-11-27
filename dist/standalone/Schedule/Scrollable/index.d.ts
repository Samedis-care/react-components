import React from "react";
import { IDayData, ScheduleAction, ScheduleFilterDefinition } from "../Common/DayContents";
/**
 * Callback to load week data from a data source
 *
 * ScrollableSchedule calls it for each week it adds to the list. A filter
 * change and a components-care language change start the list over as on
 * mount: it is emptied and filled again from the current week (offset 0) on.
 * When it is passed a new function, it calls the new one for every week in
 * the list; each week keeps its rows until the new result arrives, and a
 * result or error of an earlier call that arrives later is ignored. Pass a
 * function that changes only when the data source does (`useCallback`): a new
 * function on every render reloads the list on every render.
 * @param weekOffset The week relative to the current week of year
 * 					 Example: -1 for last week, 0 for this week, 1 for next week
 * @param filter The filter selected by the user
 * @returns A promise containing the data for the days of the week, may reject
 * 			or throw. Format: IDayData[weekday starting Monday][n]: an array of
 * 			exactly 7 days, each an array of entries (empty for a day without
 * 			entries). A failed week shows an alert "Week N could not be loaded"
 * 			with a Retry button, and below its title the `message` of the Error
 * 			(or of any other object with a string `message`) or the string it
 * 			rejected with; any other value (`undefined`, a fetch Response, …)
 * 			shows the title only. A result in any other format (fewer or more
 * 			than 7 days, `null`, `undefined`, an object keyed by day, a day that
 * 			is not an array) fails the week the same way, with the Error
 * 			"ScrollableSchedule: loadWeekCallback must return 7 days, got …",
 * 			which says what the result was instead.
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
     * Optional filter. A change calls the filter's `onChange` and starts the
     * list over at the current week, as on mount (see LoadWeekCallback).
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
