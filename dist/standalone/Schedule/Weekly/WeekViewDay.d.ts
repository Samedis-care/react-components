import React from "react";
import { IDayData } from "../Common/DayContents";
import { Moment } from "moment";
export interface WeekViewDayProps {
    /**
     * The day offset
     */
    dayIdx: number;
    /**
     * The day this component represents
     */
    day: Moment;
    /**
     * The date label
     */
    date: string;
    /**
     * The contents of the day
     */
    data: IDayData[];
    /**
     * class name to apply to root
     */
    className?: string;
    /**
     * custom CSS classes
     */
    classes?: Partial<Record<WeekViewDayClassKey, string>>;
}
/**
 * Slots of CcWeekViewDay: `paper` is the column's Paper and carries the state
 * classes `CcWeekViewDay-today`, `CcWeekViewDay-first` and
 * `CcWeekViewDay-last`; `dayContents` is the entry area (min-height 150px).
 *
 * Today's column (`CcWeekViewDay-today`, also `aria-current="date"`) has by
 * default a primary background, a bar in the primary color on its top edge
 * (its `::before`) and a bold weekday (`.CcWeekViewDay-weekday`, which
 * inherits the column's weight) and date. A theme restyles it under
 * `paper: { "&.CcWeekViewDay-today": { … } }`; keep a mark that is not a
 * color only, as forced-colors mode replaces the background.
 */
export type WeekViewDayClassKey = "paper" | "dayContents";
declare const _default: React.MemoExoticComponent<(inProps: WeekViewDayProps) => React.JSX.Element>;
export default _default;
