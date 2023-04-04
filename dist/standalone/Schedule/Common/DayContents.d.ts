import React from "react";
import { WithStyles } from "@material-ui/core";
export interface IDayData {
    /**
     * Unique identifier
     */
    id: string;
    /**
     * The text/title to display
     */
    title: React.ReactNode;
    /**
     * Optional left click handler
     */
    onClick?: React.MouseEventHandler;
    /**
     * Optional middle click handler
     */
    onAuxClick?: React.MouseEventHandler;
}
export interface ScheduleFilterDefinition {
    /**
     * Filter options (value -> label)
     */
    options: Record<string, string>;
    /**
     * Default filter value
     */
    defaultValue: string;
    /**
     * Change handler
     * @param newFilter the new selected filter
     * @remarks Use to persist filter value
     */
    onChange?: (newFilter: string) => void;
}
export interface IProps extends WithStyles {
    data: IDayData[];
}
declare const _default: React.ComponentType<Pick<IProps, "data"> & import("@material-ui/core").StyledComponentProps<"btn" | "btnDisabled">>;
export default _default;
