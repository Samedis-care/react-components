import React from "react";
import { Moment } from "moment";
import { IDayData } from "../Common/DayContents";
import { WithTranslation } from "react-i18next";
export interface IProps extends WithTranslation {
    /**
     * The moment.js object of a day in the week that should be displayed
     */
    moment: Moment;
    /**
     * Callback which gets called to set the HTML element for today, used for
     * jumpToToday
     * @param elem The HTML element
     */
    setTodayElement: (elem: HTMLElement | null) => void;
    /**
     * Callback to load more data
     * @returns The day contents for this week.
     * 			Format: IDayData[weekday starting Monday][n]
     */
    loadData: () => IDayData[][] | Promise<IDayData[][]>;
}
declare const ScrollableScheduleWeekWithTranslation: (props: Omit<IProps, keyof WithTranslation>) => React.ReactElement;
export default ScrollableScheduleWeekWithTranslation;
