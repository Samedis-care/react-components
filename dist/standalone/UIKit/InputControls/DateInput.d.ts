import React from "react";
import { DatePickerProps } from "@mui/x-date-pickers";
import { PickersTextFieldWithHelpProps } from "../PickersTextFieldWithHelp";
import { LocalizedKeyboardDatePickerProps } from "../../LocalizedDateTimePickers/LocalizedKeyboardDatePicker";
export interface DateInputProps extends Omit<PickersTextFieldWithHelpProps, "customHandleClear"> {
    /**
     * The value of the input
     */
    value: Date | null;
    /**
     * Set new value of the input
     * @param date new value
     */
    onChange: (date: Date | null) => void;
    /**
     * Boolean flag to hide Calendar Icon (only used if disabled is truthy)
     */
    hideDisabledIcon?: boolean;
    /**
     * required flag passed to text field
     */
    required?: LocalizedKeyboardDatePickerProps["required"];
    /**
     * error flag passed to text field
     */
    error?: LocalizedKeyboardDatePickerProps["error"];
    /**
     * fullWidth flag passed to text field
     */
    fullWidth?: LocalizedKeyboardDatePickerProps["fullWidth"];
    /**
     * onBlur callback passed to text field
     */
    onBlur?: LocalizedKeyboardDatePickerProps["onBlur"];
}
declare const _default: React.MemoExoticComponent<(props: DateInputProps & Omit<DatePickerProps, "value" | "onChange">) => React.JSX.Element>;
export default _default;
