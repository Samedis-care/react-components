import React, { PureComponent } from "react";
import { IDayData } from "../Common/DayContents";
import { Moment } from "moment";
export interface IProps {
    refFwd?: (elem: HTMLElement | null) => void;
    moment: Moment;
    data: IDayData[];
}
declare class ScrollableScheduleDay extends PureComponent<IProps> {
    render(): React.ReactElement;
}
export default ScrollableScheduleDay;
