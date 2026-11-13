import { jsx as _jsx } from "react/jsx-runtime";
import React, { useMemo } from "react";
import PickersTextFieldWithHelp from "../PickersTextFieldWithHelp";
import { denormalizeDate, normalizeDate } from "../../../utils/dateOnlyUtils";
import moment from "moment";
import LocalizedKeyboardDatePicker from "../../LocalizedDateTimePickers/LocalizedKeyboardDatePicker";
import accessSlotProps from "../../../utils/internal/accessSlotProps";
/**
 * Hands a date-only value to the picker
 * @param day the date-only value
 * @returns the picker's day: a Moment at local midnight of the same day
 */
const toPickerDay = (day) => moment(denormalizeDate(day));
/**
 * Takes a day from the picker
 * @param day the picker's day, a Moment in local time
 * @returns its local calendar day as a date-only value
 */
const fromPickerDay = (day) => normalizeDate(day.toDate());
/**
 * Takes a value the picker validated or accepted
 * @param value the picker's value
 * @returns its day as a date-only value; `null` for an empty or invalid one
 */
const fromPickerValue = (value) => value?.isValid() ? fromPickerDay(value) : null;
/**
 * Hands a date-only bound to the picker. The Moment is only rebuilt when the
 * day changes, not for every new Date of the same day.
 * @param day the date-only value, if any
 * @returns the picker's day; `undefined` without a valid day
 */
const usePickerDay = (day) => {
    const time = day?.getTime();
    return useMemo(() => time === undefined || Number.isNaN(time)
        ? undefined
        : toPickerDay(new Date(time)), [time]);
};
/**
 * Hands a callback that takes a date-only value to the picker
 * @param callback the callback, if any
 * @returns a callback that takes the picker's day; `undefined` without one
 */
const useDayCallback = (callback) => useMemo(() => callback && ((day) => callback(fromPickerDay(day))), [callback]);
/**
 * A date-only input: LocalizedKeyboardDatePicker whose dates are date-only
 * `Date`s (12:00 UTC, the UTC parts carry the day; see
 * `docs/DateOnlyValues.md`) instead of MUI's `Moment`s. That goes for every
 * date it takes or gives: `value`, `onChange`, `minDate`, `maxDate`,
 * `referenceDate`, `shouldDisableDate`/`Month`/`Year`, `onAccept`, `onError`,
 * `onMonthChange`, `onYearChange` and `dayOfWeekFormatter`. `slots`,
 * `slotProps` and `viewRenderers` are MUI's and see `Moment`s. There is no
 * `defaultValue`: the input is always controlled.
 */
const DateInput = (props) => {
    const { value, onChange, hideDisabledIcon, required, error, fullWidth, onBlur, helperText, minDate, maxDate, referenceDate, shouldDisableDate, shouldDisableMonth, shouldDisableYear, onAccept, onError, onMonthChange, onYearChange, dayOfWeekFormatter, ...muiProps } = props;
    // the picker compares its value by reference, so building the moment during
    // render would rebuild the field's sections on every unrelated re-render
    const pickerValue = useMemo(() => (value ? toPickerDay(value) : null), [value]);
    const pickerMinDate = usePickerDay(minDate);
    const pickerMaxDate = usePickerDay(maxDate);
    const pickerReferenceDate = usePickerDay(referenceDate);
    const pickerShouldDisableDate = useDayCallback(shouldDisableDate);
    const pickerShouldDisableMonth = useDayCallback(shouldDisableMonth);
    const pickerShouldDisableYear = useDayCallback(shouldDisableYear);
    const pickerOnMonthChange = useDayCallback(onMonthChange);
    const pickerOnYearChange = useDayCallback(onYearChange);
    const pickerDayOfWeekFormatter = useDayCallback(dayOfWeekFormatter);
    const pickerOnAccept = useMemo(() => onAccept &&
        ((accepted, context) => onAccept(fromPickerValue(accepted), context)), [onAccept]);
    const pickerOnError = useMemo(() => onError &&
        ((reason, validated) => onError(reason, fromPickerValue(validated))), [onError]);
    return (_jsx(LocalizedKeyboardDatePicker, { ...muiProps, value: pickerValue, onChange: (date) => date ? onChange(fromPickerDay(date)) : onChange(null), minDate: pickerMinDate, maxDate: pickerMaxDate, referenceDate: pickerReferenceDate, shouldDisableDate: pickerShouldDisableDate, shouldDisableMonth: pickerShouldDisableMonth, shouldDisableYear: pickerShouldDisableYear, onAccept: pickerOnAccept, onError: pickerOnError, onMonthChange: pickerOnMonthChange, onYearChange: pickerOnYearChange, dayOfWeekFormatter: pickerDayOfWeekFormatter, hideDisabledIcon: hideDisabledIcon, required: required, error: error, fullWidth: fullWidth, onBlur: onBlur, slots: {
            textField: PickersTextFieldWithHelp,
        }, slotProps: {
            ...muiProps.slotProps,
            textField: (ownerState) => {
                const textFieldSlotPropsProp = accessSlotProps(ownerState, muiProps.slotProps?.textField);
                return {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore This just passes props down to the text field component, TS defs don't support custom props here, but the implementation does.
                    customHandleClear: () => onChange(null),
                    ...textFieldSlotPropsProp,
                    // only where the caller gave one, so a helper text passed through
                    // slotProps.textField is not overwritten with undefined
                    ...(helperText === undefined ? {} : { helperText }),
                };
            },
        } }));
};
export default React.memo(DateInput);
