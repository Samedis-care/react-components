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
export type ScheduleFilterDefinition = ScheduleFilterDefinitionSelect | ScheduleFilterDefinitionSwitch;
export interface ScheduleAction {
    /**
     * unique identifier for action
     */
    id: string;
    /**
     * The button label
     */
    label: string;
    /**
     * The click handler
     */
    onClick: () => void;
    /**
     * Is the button disabled?
     */
    disabled?: boolean;
}
export interface DayContentsProps {
    /**
     * the data to display
     */
    data: IDayData[];
    /**
     * alternative border color, to maintain contrast to background
     */
    altBorder?: boolean;
    /**
     * css class to apply to root
     */
    className?: string;
    /**
     * custom CSS classes
     */
    classes?: Partial<Record<DayContentsClassKey, string>>;
}
export type IProps = DayContentsProps;
export interface DayContentsButtonOwnerState {
    altBorder: boolean;
    unClickable: boolean;
}
export type DayContentsClassKey = "button";
declare const _default: React.MemoExoticComponent<(inProps: DayContentsProps) => React.JSX.Element>;
export default _default;
