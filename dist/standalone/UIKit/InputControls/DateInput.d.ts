import React from "react";
import { DatePickerProps, DateValidationError, PickerChangeHandlerContext, PickersTextFieldProps } from "@mui/x-date-pickers";
import { PickersTextFieldWithHelpProps } from "../PickersTextFieldWithHelp";
import { LocalizedKeyboardDatePickerProps } from "../../LocalizedDateTimePickers/LocalizedKeyboardDatePicker";
export interface DateInputProps extends Omit<PickersTextFieldWithHelpProps, "customHandleClear"> {
    /**
     * The value of the input, as a date-only value (12:00 UTC, see normalizeDate)
     */
    value: Date | null;
    /**
     * Set new value of the input
     * @param date new value, as a date-only value (12:00 UTC, see normalizeDate)
     */
    onChange: (date: Date | null) => void;
    /**
     * Boolean flag to hide Calendar Icon (only used if disabled is truthy)
     */
    hideDisabledIcon?: boolean;
    /**
     * required flag passed to text field
     */
    required?: LocalizedKeyboardDatePickerProps["required"];
    /**
     * error flag passed to text field
     */
    error?: LocalizedKeyboardDatePickerProps["error"];
    /**
     * fullWidth flag passed to text field
     */
    fullWidth?: LocalizedKeyboardDatePickerProps["fullWidth"];
    /**
     * onBlur callback passed to text field
     */
    onBlur?: LocalizedKeyboardDatePickerProps["onBlur"];
    /**
     * Text below the field: a hint, or the message of a validation error or warning
     * @remarks The field group's description (`aria-describedby`), so a screen reader
     *          reads it when the user reaches the field; its color follows `error` and
     *          `warning`. Takes the place of `slotProps.textField.helperText`, which is
     *          used while this is undefined. While `error` is unset and the picker's own
     *          validation rejects the date (`minDate`, `maxDate`, …), the picker's message
     *          shows in its place (see `LocalizedKeyboardDatePickerProps`). Default: none.
     */
    helperText?: PickersTextFieldProps["helperText"];
    /**
     * The earliest day the user can pick or type, as a date-only value (12:00
     * UTC). Earlier days are disabled in the calendar, and an earlier entry is
     * rejected with `onError("minDate", …)`. `undefined` or an Invalid Date
     * leaves MUI's default, 1900-01-01.
     */
    minDate?: Date;
    /**
     * The latest day the user can pick or type, as a date-only value (12:00
     * UTC). Later days are disabled in the calendar, and a later entry is
     * rejected with `onError("maxDate", …)`. `undefined` or an Invalid Date
     * leaves MUI's default, 2099-12-31.
     */
    maxDate?: Date;
    /**
     * While `value` is `null`: the day the calendar opens on, and the one the
     * sections the user has not typed yet are taken from. A date-only value
     * (12:00 UTC); `undefined` or an Invalid Date leaves MUI's default, today
     * (moved into `minDate`/`maxDate`).
     */
    referenceDate?: Date;
    /**
     * Disables single days. Called with every day the calendar shows and with
     * the day entered, each as a date-only value (12:00 UTC, read its UTC
     * parts); return `true` to disable it. An entry on a disabled day is
     * rejected with `onError("shouldDisableDate", …)`. Default: none disabled.
     * @param day the day, as a date-only value
     * @returns whether the day is disabled
     */
    shouldDisableDate?: (day: Date) => boolean;
    /**
     * Disables whole months. Called with the first day of every month the month
     * view shows and with the day entered, each as a date-only value (12:00
     * UTC, read its UTC month); return `true` to disable the month. An entry in
     * a disabled month is rejected with `onError("shouldDisableMonth", …)`.
     * Default: none disabled.
     * @param month a day of the month, as a date-only value
     * @returns whether the month is disabled
     */
    shouldDisableMonth?: (month: Date) => boolean;
    /**
     * Disables whole years. Called with 1 January of every year the year view
     * shows and with the day entered, each as a date-only value (12:00 UTC,
     * read its UTC year); return `true` to disable the year. An entry in a
     * disabled year is rejected with `onError("shouldDisableYear", …)`.
     * Default: none disabled.
     * @param year a day of the year, as a date-only value
     * @returns whether the year is disabled
     */
    shouldDisableYear?: (year: Date) => boolean;
    /**
     * Called when MUI accepts a value: a day picked in the calendar, and every
     * change typed into the field while the calendar is closed. Unlike
     * `onChange`, it also gets entries the picker rejects; their reason is in
     * `context.validationError`.
     * @param value the accepted day as a date-only value (12:00 UTC), or `null`
     *              for an empty field or an entry that is no valid day
     * @param context MUI's context: `validationError` and `source`
     */
    onAccept?: (value: Date | null, context: PickerChangeHandlerContext<DateValidationError>) => void;
    /**
     * Called whenever the picker's validation result changes: when an entry is
     * rejected, and with `null` once it is valid again.
     * @param error why the entry is rejected (`"minDate"`, `"invalidDate"`, …),
     *              or `null`
     * @param value the entry as a date-only value (12:00 UTC), or `null` for an
     *              empty field or an entry that is no valid day
     */
    onError?: (error: DateValidationError, value: Date | null) => void;
    /**
     * Called when the calendar shows another month.
     * @param month the month's first day, as a date-only value (12:00 UTC)
     */
    onMonthChange?: (month: Date) => void;
    /**
     * Called when the calendar shows another year.
     * @param year the year's 1 January, as a date-only value (12:00 UTC)
     */
    onYearChange?: (year: Date) => void;
    /**
     * Names the weekdays in the calendar's header. Default: MUI's, the first
     * letter of the short weekday name.
     * @param day a day of the weekday, as a date-only value (12:00 UTC): read it
     *            with `getUTCDay()` or `formatDateOnly`
     * @returns the name to show
     */
    dayOfWeekFormatter?: (day: Date) => string;
}
/**
 * The props of MUI's DatePicker that carry a date. DateInput declares its own
 * for them, which use date-only values, except for `defaultValue`, which it
 * drops: the input is always controlled.
 */
type PickerDateProps = "value" | "onChange" | "defaultValue" | "minDate" | "maxDate" | "referenceDate" | "shouldDisableDate" | "shouldDisableMonth" | "shouldDisableYear" | "onAccept" | "onError" | "onMonthChange" | "onYearChange" | "dayOfWeekFormatter";
declare const _default: React.MemoExoticComponent<(props: DateInputProps & Omit<DatePickerProps, PickerDateProps>) => React.JSX.Element>;
export default _default;
