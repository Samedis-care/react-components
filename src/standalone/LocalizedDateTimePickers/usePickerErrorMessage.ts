import { usePickerAdapter } from "@mui/x-date-pickers";
import type {
	DateTimeValidationError,
	PickerValidDate,
	PickersTimezone,
} from "@mui/x-date-pickers";
import useCCTranslations from "../../utils/useCCTranslations";

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
	 * The timezone the field shows its value in: MUI's `timezone`, else the
	 * value's own, else `referenceDate`'s, else `"default"`. A limit that has a
	 * date is written in it, as the user enters dates there; a time of day alone
	 * (`minTime`, `maxTime`) is compared in its own timezone, as in MUI, and is
	 * written in that. Default: every limit in its own.
	 */
	timezone?: PickersTimezone;
}

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
const MESSAGE_KEYS: Record<NonNullable<DateTimeValidationError>, string> = {
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
 * for the locale's 12- or 24-hour clock (`hh:mm A`, `L hh:mm A` in English),
 * with the leading zeros MUI's field adds. An unset `minDate` or `maxDate` is
 * MUI's default.
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
const usePickerErrorMessage = (
	error: DateTimeValidationError,
	limits: PickerErrorMessageLimits,
): string | null => {
	const { t } = useCCTranslations();
	const adapter = usePickerAdapter();
	if (error == null) return null;
	const { withTime, timezone } = limits;
	const inFieldTimezone = (date: PickerValidDate) =>
		timezone ? adapter.setTimezone(date, timezone) : date;
	const twelveHours = adapter.is12HourCycleInCurrentLocale();
	const formatDate = (date: PickerValidDate) =>
		adapter.format(inFieldTimezone(date), "keyboardDate");
	const formatDateTime = (date: PickerValidDate) =>
		adapter.format(
			inFieldTimezone(date),
			twelveHours ? "keyboardDateTime12h" : "keyboardDateTime24h",
		);
	const formatTime = (date: PickerValidDate) =>
		adapter.format(date, twelveHours ? "fullTime12h" : "fullTime24h");
	// as MUI's date-time validation, which compares minTime and maxTime with
	// their date under these props, whatever disableIgnoringDatePartForTimeValidation says
	const timeHasDate =
		!!limits.minDateTime ||
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
			if (!limit) return t(UNAVAILABLE_TIME_KEY);
			return timeHasDate
				? t(MIN_DATE_TIME_KEY, { DATE: formatDateTime(limit) })
				: t(MESSAGE_KEYS.minTime, { TIME: formatTime(limit) });
		}
		case "maxTime": {
			const limit = limits.maxDateTime ?? limits.maxTime;
			if (!limit) return t(UNAVAILABLE_TIME_KEY);
			return timeHasDate
				? t(MAX_DATE_TIME_KEY, { DATE: formatDateTime(limit) })
				: t(MESSAGE_KEYS.maxTime, { TIME: formatTime(limit) });
		}
		case "disablePast":
			return t(withTime ? PAST_DATE_TIME_KEY : MESSAGE_KEYS.disablePast);
		case "disableFuture":
			return t(withTime ? FUTURE_DATE_TIME_KEY : MESSAGE_KEYS.disableFuture);
		case "minutesStep":
			if (!limits.minutesStep) return t(UNAVAILABLE_TIME_KEY);
			return t(MESSAGE_KEYS.minutesStep, { STEP: limits.minutesStep });
		default:
			return t(MESSAGE_KEYS[error]);
	}
};

export default usePickerErrorMessage;
