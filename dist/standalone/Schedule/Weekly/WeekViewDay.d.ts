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
export type WeekViewDayClassKey = "paper" | "dayContents";
declare const _default: React.MemoExoticComponent<(inProps: WeekViewDayProps) => React.JSX.Element>;
export default _default;
