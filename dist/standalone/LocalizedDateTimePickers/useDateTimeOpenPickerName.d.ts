import type { PickersTimezone, PickerValidDate } from "@mui/x-date-pickers";
/**
 * The accessible name of the button that opens a date and time picker's
 * calendar, in the current components-care language: "Choose date and time,
 * selected date and time is Aug 1, 2026 10:30 AM", or "Choose date and time"
 * while the field holds no valid date. MUI names that button as a date
 * picker's, after the date alone ("Choose date, selected date is Aug 1,
 * 2026"), although the calendar it opens sets the time too.
 *
 * The date is written as MUI writes it on a date picker's button, in the
 * adapter's `fullDate` format (`ll` with moment), and the time as the field
 * writes it, in the adapter's `fullTime` format for the locale's 12- or
 * 24-hour clock (`hh:mm A` in English), both in the timezone the field shows.
 * @param value The date and time the field shows; `null`, `undefined` or an
 * invalid date for none
 * @param timezone The picker's `timezone` prop, the timezone the field shows
 * the value in; undefined for the value's own, as in MUI
 * @returns The name
 */
declare const useDateTimeOpenPickerName: (value: PickerValidDate | null | undefined, timezone: PickersTimezone | undefined) => string;
export default useDateTimeOpenPickerName;
