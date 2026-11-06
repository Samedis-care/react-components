import React from "react";
import { Moment } from "moment";
import { WithTranslation } from "react-i18next";
import type { LoadWeekCallback } from "./index";
export interface IProps extends WithTranslation {
    /**
     * The week to display, in weeks relative to the week of `today`
     */
    weekOffset: number;
    /**
     * The day the week offsets count from (ScrollableSchedule's today); not
     * modified
     */
    today: Moment;
    /**
     * Callback which gets called to set the HTML element for today, used for
     * jumpToToday
     * @param elem The HTML element
     */
    setTodayElement: (elem: HTMLElement | null) => void;
    /**
     * Loads the week, called with `weekOffset` and `filterValues` on mount and
     * again when one of the three changes. The rows shown stay until the new
     * result arrives; the result of an earlier call that arrives later is
     * ignored.
     */
    loadWeekCallback: LoadWeekCallback;
    /**
     * The filter values passed to `loadWeekCallback`
     */
    filterValues: Record<string, string | boolean>;
}
declare const ScrollableScheduleWeekWithTranslation: (props: Omit<IProps, keyof WithTranslation>) => React.ReactElement;
export default ScrollableScheduleWeekWithTranslation;
