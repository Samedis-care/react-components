import React from "react";
import { DateTimePickerProps } from "@mui/x-date-pickers";
import { UIInputProps } from "../CommonStyles";
import { LocalizedDateTimePickerProps } from "../../../standalone/LocalizedDateTimePickers/LocalizedDateTimePicker";
export interface DateTimeInputProps extends UIInputProps {
    openInfo?: () => void;
    /**
     * Set required flag for text field input
     */
    required?: LocalizedDateTimePickerProps["required"];
    /**
     * Set error flag for text field input
     */
    error?: LocalizedDateTimePickerProps["error"];
    /**
     * onBlur callback for the text field input
     */
    onBlur?: LocalizedDateTimePickerProps["onBlur"];
    /**
     * full width?
     */
    fullWidth?: LocalizedDateTimePickerProps["fullWidth"];
}
declare const _default: React.MemoExoticComponent<(props: DateTimeInputProps & DateTimePickerProps) => React.JSX.Element>;
export default _default;
