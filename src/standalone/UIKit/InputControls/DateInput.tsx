import React, { useMemo } from "react";
import { DatePickerProps, PickersTextFieldProps } from "@mui/x-date-pickers";
import PickersTextFieldWithHelp, {
	PickersTextFieldWithHelpProps,
} from "../PickersTextFieldWithHelp";
import { denormalizeDate, normalizeDate } from "../../../utils/dateOnlyUtils";
import moment from "moment";
import LocalizedKeyboardDatePicker, {
	LocalizedKeyboardDatePickerProps,
} from "../../LocalizedDateTimePickers/LocalizedKeyboardDatePicker";
import accessSlotProps from "../../../utils/internal/accessSlotProps";

export interface DateInputProps extends Omit<
	PickersTextFieldWithHelpProps,
	"customHandleClear"
> {
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
}

const DateInput = (
	props: DateInputProps & Omit<DatePickerProps, "value" | "onChange">,
) => {
	const {
		value,
		onChange,
		hideDisabledIcon,
		required,
		error,
		fullWidth,
		onBlur,
		...muiProps
	} = props;

	// the picker compares its value by reference, so building the moment during
	// render would rebuild the field's sections on every unrelated re-render
	const pickerValue = useMemo(
		() => (value ? moment(denormalizeDate(value)) : null),
		[value],
	);

	return (
		<LocalizedKeyboardDatePicker
			{...muiProps}
			value={pickerValue}
			onChange={(date) =>
				date ? onChange(normalizeDate(date.toDate())) : onChange(null)
			}
			hideDisabledIcon={hideDisabledIcon}
			required={required}
			error={error}
			fullWidth={fullWidth}
			onBlur={onBlur}
			slots={{
				textField: PickersTextFieldWithHelp,
			}}
			slotProps={{
				...muiProps.slotProps,
				textField: (ownerState) => {
					const textFieldSlotPropsProp = accessSlotProps(
						ownerState,
						muiProps.slotProps?.textField,
					) as PickersTextFieldProps;
					return {
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore This just passes props down to the text field component, TS defs don't support custom props here, but the implementation does.
						customHandleClear: () => onChange(null),
						...textFieldSlotPropsProp,
					};
				},
			}}
		/>
	);
};

export default React.memo(DateInput);
