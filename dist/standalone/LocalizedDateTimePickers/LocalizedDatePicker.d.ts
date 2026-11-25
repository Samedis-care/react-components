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
 *
 * Keyboard focus shows as a 2px ring in `palette.primary.main` on the button
 * that opens the calendar and on every control of the open calendar, the
 * desktop popup and the mobile dialog alike, where MUI shows only a faint
 * tint or a ripple (see `calendarFocusRingSlotProps`). When the theme sets
 * MUI's `focusVisible` ring, that ring is the one shown. The ring comes with
 * the default `slots.openPickerButton`, which a caller's own button replaces,
 * and goes into `slotProps.layout.sx`, which keeps a caller's layout slot
 * props and puts a caller's `sx` after it.
 */
export interface LocalizedDatePickerProps extends Omit<DatePickerProps, "format"> {
    /**
     * Called once the user is done with the date: when focus leaves the field
     * (right before `onBlur`), on Enter in the field, and when the calendar
     * accepts a date (a day picked in the desktop calendar, OK in the mobile
     * dialog, or the calendar closed with Escape or a click outside it, which
     * keeps the date picked in it, as in MUI). It gets the date the field
     * shows, if the picker accepts it, or `null` for an empty field, and only if
     * that differs from the date reported last or handed in as `value` since.
     * Not reported are the dates the field passes through while the user types
     * (a half-typed year, the dates on the way while a day, month or year is
     * retyped, the `null` of a section deleted to retype it), an entry the
     * picker rejects (see `onError`), and a day picked in the mobile dialog
     * until OK; Cancel there reports nothing. So a form, its dirty state and its
     * save button see a typed date once the user leaves the field or presses
     * Enter. Moving to a button of the field (the open-picker button, an
     * adornment) is not leaving it. With `publishIntermediateValues` it is
     * called for every change instead.
     * @param value The date, or `null`
     * @param context MUI's context: `validationError` (`null`, the date being
     * accepted) and `source`
     */
    onChange?: DatePickerProps["onChange"];
    /**
     * Report every change at once, rather than a date once the user is done
     * with it (see `onChange`): every keystroke, entries the picker rejects
     * included, as MUI's own picker does. Default `false`. See
     * {@link usePickerDraft}.
     */
    publishIntermediateValues?: boolean;
    /**
     * The accessible name of the picker, for a picker without a visible
     * `label`, such as the translated purpose of the date ("From", "To"). It
     * names the field (its `role="group"`, which a screen reader announces when
     * focus enters a section) and the open calendar dialog: the desktop popup
     * and the mobile dialog, also while the mobile dialog shows its title
     * ("Select date"). A visible `label` takes its place, as in MUI: the label
     * names the field and the desktop popup, and the mobile dialog's title
     * names the mobile dialog. Default: none. A picker with neither has an
     * unnamed field, and its calendar is named after MUI's title of the mobile
     * dialog, "Select date".
     */
    "aria-label"?: string;
}
declare const _default: React.MemoExoticComponent<React.ComponentType<LocalizedDatePickerProps & import("..").MuiFieldStateProps>>;
export default _default;
