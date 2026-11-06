import React from "react";
import { DateTimePickerProps, PickersTextFieldProps } from "@mui/x-date-pickers";
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
    /**
     * Text below the field: a hint, or the message of a validation error or warning
     * @remarks The field group's description (`aria-describedby`), so a screen reader
     *          reads it when the user reaches the field; its color follows `error` and
     *          `warning`. Takes the place of `slotProps.textField.helperText`, which is
     *          used while this is undefined. Default: none.
     */
    helperText?: PickersTextFieldProps["helperText"];
}
declare const _default: React.MemoExoticComponent<(props: DateTimeInputProps & DateTimePickerProps) => React.JSX.Element>;
export default _default;
