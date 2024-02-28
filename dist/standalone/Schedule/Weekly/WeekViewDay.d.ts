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
}
declare const _default: React.MemoExoticComponent<(props: WeekViewDayProps) => React.JSX.Element>;
export default _default;
