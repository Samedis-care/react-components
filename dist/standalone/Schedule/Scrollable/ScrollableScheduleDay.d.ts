import React from "react";
import { IDayData } from "../Common/DayContents";
import { Moment } from "moment";
export interface ScrollableScheduleDayProps {
    /**
     * The day of the row, formatted in its own locale: the label shows
     * "DD ddd", and the row is a group named by the full date, "dddd, LL"
     * ("Wednesday, October 14, 2026" in en)
     */
    moment: Moment;
    /**
     * Marks the row as today's: the root gets the class
     * `CcScrollableScheduleDay-today` and `aria-current="date"`. By default
     * the row then has a bar in the primary color on its left edge and its
     * date label is bold. Default false
     */
    today?: boolean;
    /**
     * The day's entries, in display order
     */
    data: IDayData[];
}
/**
 * Slots of CcScrollableScheduleDay: `root` is the day row, `label` the cell
 * with its date label and `fullDate` the full date inside it, which is
 * visually hidden and names the row for assistive technology. Today's row also
 * has the class `CcScrollableScheduleDay-today`, for a theme to style it with
 * `root: { "&.CcScrollableScheduleDay-today": { … } }`.
 */
export type ScrollableScheduleDayClassKey = "root" | "label" | "fullDate";
declare const _default: React.NamedExoticComponent<ScrollableScheduleDayProps & React.RefAttributes<HTMLDivElement>>;
export default _default;
