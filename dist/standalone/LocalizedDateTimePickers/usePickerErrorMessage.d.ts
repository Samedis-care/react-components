import type { DateValidationError, PickerValidDate } from "@mui/x-date-pickers";
/** The limits a date picker's message names */
export interface PickerErrorMessageLimits {
    /** The picker's `minDate`, if set */
    minDate?: PickerValidDate;
    /** The picker's `maxDate`, if set */
    maxDate?: PickerValidDate;
}
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
declare const usePickerErrorMessage: (error: DateValidationError, limits: PickerErrorMessageLimits) => string | null;
export default usePickerErrorMessage;
