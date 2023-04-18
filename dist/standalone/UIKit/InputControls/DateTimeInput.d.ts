import React from "react";
import { TextFieldProps } from "@mui/material";
import { DateTimePickerProps } from "@mui/x-date-pickers";
import { UIInputProps } from "../CommonStyles";
import { Moment } from "moment";
export interface DateTimeInputProps extends UIInputProps {
    openInfo?: () => void;
    /**
     * Set required flag for text field input
     */
    required?: TextFieldProps["required"];
    /**
     * Set error flag for text field input
     */
    error?: TextFieldProps["error"];
    /**
     * onBlur callback for the text field input
     */
    onBlur?: TextFieldProps["onBlur"];
}
declare const _default: React.MemoExoticComponent<(props: DateTimeInputProps & DateTimePickerProps<Moment | null>) => JSX.Element>;
export default _default;
