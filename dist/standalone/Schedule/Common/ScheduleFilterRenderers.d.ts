import React from "react";
import { ScheduleFilterDefinitionSelect, ScheduleFilterDefinitionSwitch } from "./DayContents";
interface ScheduleFilterRendererSelectProps extends Pick<ScheduleFilterDefinitionSelect, "type" | "options"> {
    /**
     * The name of the filter
     */
    name: string;
    /**
     * The current value
     */
    value: string;
    /**
     * The change handler
     */
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
    /**
     * render inline?
     */
    inline?: "scrollable" | "weekly";
}
interface ScheduleFilterRendererSwitchProps extends Pick<ScheduleFilterDefinitionSwitch, "type" | "label"> {
    /**
     * The name of the filter
     */
    name: string;
    /**
     * The current value
     */
    value: boolean;
    /**
     * The change handler
     */
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    /**
     * render inline?
     */
    inline?: "scrollable" | "weekly";
}
declare const _default: React.MemoExoticComponent<(props: Omit<ScheduleFilterRendererSelectProps | ScheduleFilterRendererSwitchProps, "value"> & {
    value: string | boolean;
}) => React.JSX.Element>;
export default _default;
