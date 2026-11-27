import React from "react";
import { DateTimePickerProps, PickersTextFieldProps } from "@mui/x-date-pickers";
import { UIInputProps } from "../CommonStyles";
import { LocalizedDateTimePickerProps } from "../../../standalone/LocalizedDateTimePickers/LocalizedDateTimePicker";
export interface DateTimeInputProps extends UIInputProps {
    openInfo?: () => void;
    /**
     * The accessible name of the input, for one without a visible `label`,
     * such as the translated purpose of the date ("From", "To"). It names the
     * field (its `role="group"`, which a screen reader announces when focus
     * enters a section) and the open calendar dialog. A visible `label` takes
     * its place, as in MUI. Default: none, so an input without a `label` has an
     * unnamed field. See `LocalizedDateTimePickerProps["aria-label"]`.
     */
    "aria-label"?: LocalizedDateTimePickerProps["aria-label"];
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
     * Called with the new date and time once the user is done with it: when
     * focus leaves the field (before `onBlur`), on Enter in the field, and when
     * the calendar accepts it. Only a date the picker accepts, or `null` for an
     * empty field, is reported, and only when it differs from the date reported
     * last or handed in as `value` since; the dates the field passes through
     * while the user types are not. See `LocalizedDateTimePickerProps.onChange`.
     */
    onChange?: LocalizedDateTimePickerProps["onChange"];
    /**
     * Called with every date and time reported to `onChange`, right after it
     * and with the same arguments, so never with a value the field passes
     * through while the user types or one the picker rejects. See
     * `LocalizedDateTimePickerProps.onAccept`.
     */
    onAccept?: LocalizedDateTimePickerProps["onAccept"];
    /**
     * full width?
     */
    fullWidth?: LocalizedDateTimePickerProps["fullWidth"];
    /**
     * Text below the field: a hint, or the message of a validation error or warning
     * @remarks The field group's description (`aria-describedby`), so a screen reader
     *          reads it when the user reaches the field; its color follows `error` and
     *          `warning`. Takes the place of `slotProps.textField.helperText`, which is
     *          used while this is undefined. While `error` is unset and the picker's own
     *          validation rejects the value (`minDateTime`, `minTime`, …), the picker's
     *          message shows in its place (see `LocalizedDateTimePickerProps`). Default:
     *          none.
     */
    helperText?: PickersTextFieldProps["helperText"];
}
declare const _default: React.MemoExoticComponent<(props: DateTimeInputProps & DateTimePickerProps) => React.JSX.Element>;
export default _default;
