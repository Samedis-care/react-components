import React from "react";
import { DatePickerProps } from "@mui/x-date-pickers";
import { TextFieldProps } from "@mui/material";
import { TextFieldWithHelpProps } from "../UIKit/TextFieldWithHelp";
export interface LocalizedKeyboardDatePickerProps extends Omit<DatePickerProps, "format">, Pick<TextFieldWithHelpProps, "disableClearable"> {
    /**
     * Boolean flag to hide Calendar Icon (only used if disabled is truthy)
     */
    hideDisabledIcon?: boolean;
    /**
     * Marks the field required: an asterisk after the label, `required` on the
     * hidden input and `aria-required` on every section, so screen readers
     * announce it. When set, also to `false`, it takes precedence over
     * `slotProps.textField.required`; leave it undefined to use that.
     */
    required?: TextFieldProps["required"];
    /**
     * Forces the error state of the field: red outline and label, and
     * `aria-invalid` on the field group and on every section, so a screen reader
     * announces it while the user types. When set, also to `false`, it replaces
     * the picker's own validation state, which is used while it is undefined.
     * Takes precedence over `slotProps.textField.error` when set.
     */
    error?: TextFieldProps["error"];
    /**
     * Set error flag for text field input
     */
    fullWidth?: TextFieldProps["fullWidth"];
    /**
     * Called once focus leaves the field: from a section, the open-picker button
     * or another adornment to anything outside the field and its open popup.
     * Moving between those is not leaving. Focus that leaves from inside the open
     * popup (a click on another control while the calendar is open) is not
     * reported. Receives the blur event of the field's input root
     * (`role="group"`); `target` is the element that lost focus.
     */
    onBlur?: TextFieldProps["onBlur"];
    /**
     * Report every keystroke, rather than only dates the user finished entering.
     * See {@link usePickerDraft}.
     */
    publishIntermediateValues?: boolean;
}
export type LocalizedKeyboardDatePickerClassKey = never;
declare const _default: React.MemoExoticComponent<React.ComponentType<LocalizedKeyboardDatePickerProps & import("..").MuiFieldStateProps>>;
export default _default;
