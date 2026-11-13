import React from "react";
import { DatePickerProps } from "@mui/x-date-pickers";
/**
 * Props of a date picker (MUI's `DatePicker` with the `L` format of the
 * current language).
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
 * valid. A caller that sets `slotProps.textField.error` (also to `false`)
 * decides the error state and its text itself, and gets no message: to show
 * a text of its own, set `error` from `onError` and pass that text as
 * `helperText`.
 */
export interface LocalizedDatePickerProps extends Omit<DatePickerProps, "format"> {
    /**
     * Report every keystroke, rather than only dates the user finished entering.
     * See {@link usePickerDraft}.
     */
    publishIntermediateValues?: boolean;
}
declare const _default: React.MemoExoticComponent<React.ComponentType<LocalizedDatePickerProps & import("..").MuiFieldStateProps>>;
export default _default;
