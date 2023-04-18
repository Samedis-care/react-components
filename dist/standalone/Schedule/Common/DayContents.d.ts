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
export interface DayContentsProps {
    data: IDayData[];
}
export declare type IProps = DayContentsProps;
declare const _default: React.MemoExoticComponent<(props: DayContentsProps) => JSX.Element>;
export default _default;
