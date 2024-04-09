import React from "react";
import { DatePickerProps } from "@mui/x-date-pickers";
import { TextFieldProps } from "@mui/material";
import { Moment } from "moment";
export interface LocalizedKeyboardDatePickerProps extends Omit<DatePickerProps<Moment>, "format"> {
    /**
     * Boolean flag to hide Calendar Icon (only used if disabled is truthy)
     */
    hideDisabledIcon?: boolean;
    /**
     * Set required flag for text field input
     */
    required?: TextFieldProps["required"];
    /**
     * Set error flag for text field input
     */
    error?: TextFieldProps["error"];
    /**
     * Set error flag for text field input
     */
    fullWidth?: TextFieldProps["fullWidth"];
    /**
     * onBlur callback for the text field input
     */
    onBlur?: TextFieldProps["onBlur"];
}
export type LocalizedKeyboardDatePickerClassKey = never;
declare const _default: React.MemoExoticComponent<React.ComponentType<LocalizedKeyboardDatePickerProps & import("../UIKit/MuiWarning").MuiWarningResultProps>>;
export default _default;
