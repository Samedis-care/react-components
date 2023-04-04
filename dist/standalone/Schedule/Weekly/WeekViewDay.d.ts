import React from "react";
import { IDayData } from "../Common/DayContents";
import { WithStyles } from "@material-ui/core";
import { Moment } from "moment";
export interface IProps extends WithStyles {
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
declare const _default: React.ComponentType<Pick<IProps, "data" | "date" | "day" | "dayIdx"> & import("@material-ui/core").StyledComponentProps<never>>;
export default _default;
