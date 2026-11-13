import { usePickerAdapter } from "@mui/x-date-pickers";
import type { DateValidationError, PickerValidDate } from "@mui/x-date-pickers";
import useCCTranslations from "../../utils/useCCTranslations";

/** The limits a date picker's message names */
export interface PickerErrorMessageLimits {
	/** The picker's `minDate`, if set */
	minDate?: PickerValidDate;
	/** The picker's `maxDate`, if set */
	maxDate?: PickerValidDate;
}

/**
 * The translation key for each of MUI's date validation errors. A record, so a
 * reason MUI adds fails the type check until it has a message.
 */
const MESSAGE_KEYS: Record<NonNullable<DateValidationError>, string> = {
	invalidDate: "standalone.date-picker.error.invalid",
	minDate: "standalone.date-picker.error.min-date",
	maxDate: "standalone.date-picker.error.max-date",
	disablePast: "standalone.date-picker.error.past",
	disableFuture: "standalone.date-picker.error.future",
	shouldDisableDate: "standalone.date-picker.error.unavailable",
	shouldDisableMonth: "standalone.date-picker.error.unavailable",
	shouldDisableYear: "standalone.date-picker.error.unavailable",
};

/**
 * MUI's documented defaults for `minDate` and `maxDate`, which its validation
 * applies when the prop is not set
 */
const DEFAULT_MIN_DATE = "1900-01-01T00:00:00.000";
const DEFAULT_MAX_DATE = "2099-12-31T00:00:00.000";

/**
 * Says in the current components-care language what is wrong with a date that
 * MUI's validation of a date picker rejects: "Enter a valid date", "Enter a date
 * on or after 01/01/2020", … A limit is written as the field writes dates
 * (the adapter's `keyboardDate` format, `L` with moment), in the adapter's
 * locale; an unset `minDate` or `maxDate` is MUI's default.
 * @param error MUI's validation error, `null` for none
 * @param limits The picker's `minDate` and `maxDate`
 * @returns The message, `null` while there is no error
 */
const usePickerErrorMessage = (
	error: DateValidationError,
	limits: PickerErrorMessageLimits,
): string | null => {
	const { t } = useCCTranslations();
	const adapter = usePickerAdapter();
	if (error == null) return null;
	const formatDate = (date: PickerValidDate) =>
		adapter.format(date, "keyboardDate");
	switch (error) {
		case "minDate":
			return t(MESSAGE_KEYS.minDate, {
				DATE: formatDate(limits.minDate ?? adapter.date(DEFAULT_MIN_DATE)),
			});
		case "maxDate":
			return t(MESSAGE_KEYS.maxDate, {
				DATE: formatDate(limits.maxDate ?? adapter.date(DEFAULT_MAX_DATE)),
			});
		default:
			return t(MESSAGE_KEYS[error]);
	}
};

export default usePickerErrorMessage;
