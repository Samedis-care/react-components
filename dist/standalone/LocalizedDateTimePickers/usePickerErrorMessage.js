import { usePickerAdapter } from "@mui/x-date-pickers";
import useCCTranslations from "../../utils/useCCTranslations";
/**
 * Also the message of a time limit the picker's props do not show, such as one
 * set in the theme's default props
 */
const UNAVAILABLE_TIME_KEY = "standalone.date-picker.error.unavailable-time";
/**
 * The translation key for each of MUI's validation errors of a date or a date
 * and time. A record, so a reason MUI adds fails the type check until it has a
 * message.
 */
const MESSAGE_KEYS = {
    invalidDate: "standalone.date-picker.error.invalid",
    minDate: "standalone.date-picker.error.min-date",
    maxDate: "standalone.date-picker.error.max-date",
    disablePast: "standalone.date-picker.error.past",
    disableFuture: "standalone.date-picker.error.future",
    shouldDisableDate: "standalone.date-picker.error.unavailable",
    shouldDisableMonth: "standalone.date-picker.error.unavailable",
    shouldDisableYear: "standalone.date-picker.error.unavailable",
    minTime: "standalone.date-picker.error.min-time",
    maxTime: "standalone.date-picker.error.max-time",
    minutesStep: "standalone.date-picker.error.minutes-step",
    "shouldDisableTime-hours": UNAVAILABLE_TIME_KEY,
    "shouldDisableTime-minutes": UNAVAILABLE_TIME_KEY,
    "shouldDisableTime-seconds": UNAVAILABLE_TIME_KEY,
};
const MIN_DATE_TIME_KEY = "standalone.date-picker.error.min-date-time";
const MAX_DATE_TIME_KEY = "standalone.date-picker.error.max-date-time";
const PAST_DATE_TIME_KEY = "standalone.date-picker.error.past-date-time";
const FUTURE_DATE_TIME_KEY = "standalone.date-picker.error.future-date-time";
/**
 * MUI's documented defaults for `minDate` and `maxDate`, which its validation
 * applies when the prop is not set
 */
const DEFAULT_MIN_DATE = "1900-01-01T00:00:00.000";
const DEFAULT_MAX_DATE = "2099-12-31T00:00:00.000";
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
const usePickerErrorMessage = (error, limits) => {
    const { t } = useCCTranslations();
    const adapter = usePickerAdapter();
    if (error == null)
        return null;
    const { withTime, timezone, format } = limits;
    const inFieldTimezone = (date) => timezone ? adapter.setTimezone(date, timezone) : date;
    const twelveHours = limits.ampm ?? adapter.is12HourCycleInCurrentLocale();
    const formatDate = (date) => format && !withTime
        ? adapter.formatByString(inFieldTimezone(date), format)
        : adapter.format(inFieldTimezone(date), "keyboardDate");
    // only a date-time picker's errors name a date and time
    const formatDateTime = (date) => format
        ? adapter.formatByString(inFieldTimezone(date), format)
        : adapter.format(inFieldTimezone(date), twelveHours ? "keyboardDateTime12h" : "keyboardDateTime24h");
    const formatTime = (date) => adapter.format(date, twelveHours ? "fullTime12h" : "fullTime24h");
    // as MUI's date-time validation, which compares minTime and maxTime with
    // their date under these props, whatever disableIgnoringDatePartForTimeValidation says
    const timeHasDate = !!limits.minDateTime ||
        !!limits.maxDateTime ||
        !!limits.disablePast ||
        !!limits.disableFuture;
    switch (error) {
        case "minDate":
            if (withTime && limits.minDateTime) {
                return t(MIN_DATE_TIME_KEY, {
                    DATE: formatDateTime(limits.minDateTime),
                });
            }
            return t(MESSAGE_KEYS.minDate, {
                DATE: formatDate(limits.minDate ?? adapter.date(DEFAULT_MIN_DATE)),
            });
        case "maxDate":
            if (withTime && limits.maxDateTime) {
                return t(MAX_DATE_TIME_KEY, {
                    DATE: formatDateTime(limits.maxDateTime),
                });
            }
            return t(MESSAGE_KEYS.maxDate, {
                DATE: formatDate(limits.maxDate ?? adapter.date(DEFAULT_MAX_DATE)),
            });
        case "minTime": {
            const limit = limits.minDateTime ?? limits.minTime;
            if (!limit)
                return t(UNAVAILABLE_TIME_KEY);
            return timeHasDate
                ? t(MIN_DATE_TIME_KEY, { DATE: formatDateTime(limit) })
                : t(MESSAGE_KEYS.minTime, { TIME: formatTime(limit) });
        }
        case "maxTime": {
            const limit = limits.maxDateTime ?? limits.maxTime;
            if (!limit)
                return t(UNAVAILABLE_TIME_KEY);
            return timeHasDate
                ? t(MAX_DATE_TIME_KEY, { DATE: formatDateTime(limit) })
                : t(MESSAGE_KEYS.maxTime, { TIME: formatTime(limit) });
        }
        case "disablePast":
            return t(withTime ? PAST_DATE_TIME_KEY : MESSAGE_KEYS.disablePast);
        case "disableFuture":
            return t(withTime ? FUTURE_DATE_TIME_KEY : MESSAGE_KEYS.disableFuture);
        case "minutesStep":
            if (!limits.minutesStep)
                return t(UNAVAILABLE_TIME_KEY);
            return t(MESSAGE_KEYS.minutesStep, { STEP: limits.minutesStep });
        default:
            return t(MESSAGE_KEYS[error]);
    }
};
export default usePickerErrorMessage;
