import React from "react";
import { DateTimePickerProps, PickersTextFieldProps } from "@mui/x-date-pickers";
import { TextFieldProps } from "@mui/material";
interface LocalizedDateTimePickerProps extends Omit<DateTimePickerProps, "format"> {
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
    onBlur?: TextFieldProps["onBlur"] & PickersTextFieldProps["onBlur"];
}
declare const _default: React.MemoExoticComponent<React.ComponentType<LocalizedDateTimePickerProps & import("../UIKit").MuiWarningResultProps>>;
export default _default;
