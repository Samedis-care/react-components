import React from "react";
import { WithStyles } from "@material-ui/core";
import { IDayData, ScheduleFilterDefinition } from "../Common/DayContents";
import { WithTranslation } from "react-i18next";
export interface IProps extends WithStyles, WithTranslation {
    /**
     * Callback to load data of this week
     * @param weekOffset The offset to the current week
     * @param filter The selected filter
     */
    loadData: (weekOffset: number, filter: string | null) => IDayData[][] | Promise<IDayData[][]>;
    /**
     * Optional filter
     */
    filter?: ScheduleFilterDefinition;
}
declare const WeekViewWithTranslation: (props: Omit<IProps, keyof WithTranslation | keyof WithStyles>) => React.ReactElement;
export default WeekViewWithTranslation;
