import React from "react";
import { IDayData } from "../Common/DayContents";
import { Moment } from "moment";
export interface ScrollableScheduleDayProps {
    moment: Moment;
    today?: boolean;
    data: IDayData[];
}
export type ScrollableScheduleDayClassKey = "root";
declare const _default: React.MemoExoticComponent<React.ForwardRefExoticComponent<ScrollableScheduleDayProps & React.RefAttributes<HTMLDivElement>>>;
export default _default;
