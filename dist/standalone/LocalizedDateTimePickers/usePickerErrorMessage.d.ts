import type { DateTimeValidationError, PickerValidDate, PickersTimezone } from "@mui/x-date-pickers";
/**
 * The validation props of a picker that its message names, and how the field
 * shows its value
 */
export interface PickerErrorMessageLimits {
    /** The picker's `minDate`, if set */
    minDate?: PickerValidDate;
    /** The picker's `maxDate`, if set */
    maxDate?: PickerValidDate;
    /**
     * A date-time picker's `minDateTime`, if set: MUI's `minDate` and `minTime`
     * in one, with the date
     */
    minDateTime?: PickerValidDate;
    /** A date-time picker's `maxDateTime`, if set */
    maxDateTime?: PickerValidDate;
    /** A date-time picker's `minTime`, if set */
    minTime?: PickerValidDate;
    /** A date-time picker's `maxTime`, if set */
    maxTime?: PickerValidDate;
    /** A date-time picker's `minutesStep`, if set */
    minutesStep?: number;
    /** The picker's `disablePast` */
    disablePast?: boolean;
    /** The picker's `disableFuture` */
    disableFuture?: boolean;
    /**
     * Whether the field shows a time after the date, as a date-time picker's
     * does. Its limits are then written with the time where the picker compares
     * the time, and `disablePast` and `disableFuture` ask for a date and time.
     * Default `false`.
     */
    withTime?: boolean;
    /**
     * The picker's `format`, if the caller set one: a limit of the kind the
     * field shows, a date on a date picker and a date and time with
     * `withTime`, is then written in it, as the field writes its value. A date
     * alone and a time alone on a date-time picker keep the adapter's formats.
     * Default: none, every limit in the adapter's formats.
     */
    format?: string;
    /**
     * Whether the field shows the time on a 12-hour clock with AM/PM: a
     * date-time picker's `ampm`. Default: the clock of the adapter's locale, as
     * in MUI.
     */
    ampm?: boolean;
    /**
     * The timezone the field shows its value in: MUI's `timezone`, else the
     * value's own, else `referenceDate`'s, else `"default"`. A limit that has a
     * date is written in it, as the user enters dates there; a time of day alone
     * (`minTime`, `maxTime`) is compared in its own timezone, as in MUI, and is
     * written in that. Default: every limit in its own.
     */
    timezone?: PickersTimezone;
}
/**
 * Says in the current components-care language what is wrong with a date, or
 * a date and time, that MUI's validation of a picker rejects: "Enter a valid
 * date", "Enter a date on or after 01/01/2020", "Enter a time at or after
 * 09:00 AM", … A limit is written as the field writes it, in the adapter's
 * locale: a date in the adapter's `keyboardDate` format (`L` with moment), a
 * time and a date and time in its `fullTime` and `keyboardDateTime` formats
 * for the field's 12- or 24-hour clock (`ampm`, by default the locale's:
 * `hh:mm A`, `L hh:mm A` in English), with the leading zeros MUI's field
 * adds; a limit of the kind the field shows in the caller's `format`, if set.
 * An unset `minDate` or `maxDate` is MUI's default.
 *
 * With `withTime`, it follows MUI's date-time validation: `minDateTime` is the
 * `minDate` and the `minTime`, so either error asks for a date and time on or
 * after it; a `minTime` is compared with its date while `minDateTime`,
 * `maxDateTime`, `disablePast` or `disableFuture` is set, and otherwise as a
 * time of day.
 * @param error MUI's validation error, `null` for none
 * @param limits The picker's limits, and how its field shows the value
 * @returns The message, `null` while there is no error
 */
declare const usePickerErrorMessage: (error: DateTimeValidationError, limits: PickerErrorMessageLimits) => string | null;
export default usePickerErrorMessage;
