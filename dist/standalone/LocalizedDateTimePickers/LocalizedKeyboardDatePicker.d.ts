import React from "react";
import { DatePickerProps } from "@mui/x-date-pickers";
import { TextFieldProps } from "@mui/material";
import { TextFieldWithHelpProps } from "../UIKit/TextFieldWithHelp";
/**
 * Props of a date picker typed into with the keyboard (MUI's `DatePicker`
 * with the `L` format of the current language).
 *
 * While the picker's own validation rejects the date the field shows
 * (`minDate`, `maxDate`, `disablePast`, `disableFuture`, `shouldDisableDate`,
 * an impossible date such as 02/31), the field says why in a message under it,
 * in the components-care language: "Enter a date on or after 01/01/2020". The
 * message takes the place of `slotProps.textField.helperText` and is the
 * field's description. A rejection that comes up while the user is in the
 * field shows once focus leaves it, so a year typed through 0002 does not
 * flash it; one that comes up while the user is elsewhere (a date set from
 * outside, a changed `minDate`) shows at once. It goes as soon as the date is
 * valid. A caller that sets `error` (also to `false`) decides the error state
 * and its text itself, and gets no message: to show a text of its own, set
 * `error` from `onError` and pass that text as `helperText`.
 */
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
     * the picker's own validation state, which is used while it is undefined,
     * and with it the picker's own message under the field. Takes precedence
     * over `slotProps.textField.error` when set.
     */
    error?: TextFieldProps["error"];
    /**
     * Set error flag for text field input
     */
    fullWidth?: TextFieldProps["fullWidth"];
    /**
     * Called once focus leaves the field: from a section, the open-picker button,
     * another adornment or the open calendar to anything outside the field and
     * its open calendar (a click on another control while the calendar is open
     * counts). Moving between those is not leaving. Receives a blur event of the
     * field's input root (`role="group"`); `target` is the element that lost
     * focus, also one in the calendar.
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
