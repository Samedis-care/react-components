import React from "react";
import { IDayData } from "../Common/DayContents";
import { Moment } from "moment";
export interface ScrollableScheduleDayProps {
    moment: Moment;
    /**
     * Marks the row as today's: the root gets the class
     * `CcScrollableScheduleDay-today` and `aria-current="date"`. By default
     * the row then has a bar in the primary color on its left edge and its
     * date label is bold. Default false
     */
    today?: boolean;
    data: IDayData[];
}
/**
 * Slots of CcScrollableScheduleDay: `root` is the day row. Today's row also
 * has the class `CcScrollableScheduleDay-today`, for a theme to style it with
 * `root: { "&.CcScrollableScheduleDay-today": { … } }`.
 */
export type ScrollableScheduleDayClassKey = "root";
declare const _default: React.NamedExoticComponent<ScrollableScheduleDayProps & React.RefAttributes<HTMLDivElement>>;
export default _default;
