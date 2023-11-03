import React from "react";
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
export interface ScheduleFilterDefinitionSelect {
    type: "select";
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
export interface ScheduleFilterDefinitionSwitch {
    type: "checkbox";
    /**
     * Default filter value
     */
    defaultValue: boolean;
    /**
     * Change handler
     * @param newFilter the new filter value
     * @remarks Use to persist filter value
     */
    onChange?: (newFilter: boolean) => void;
    /**
     * Label of the filter
     */
    label: string;
}
export declare type ScheduleFilterDefinition = ScheduleFilterDefinitionSelect | ScheduleFilterDefinitionSwitch;
export interface DayContentsProps {
    data: IDayData[];
    altBorder?: boolean;
}
export declare type IProps = DayContentsProps;
declare const _default: React.MemoExoticComponent<(props: DayContentsProps) => JSX.Element>;
export default _default;
