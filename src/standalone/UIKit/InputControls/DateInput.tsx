import React from "react";
import { DatePickerProps } from "@mui/x-date-pickers";
import { InputLabelConfig } from "../CommonStyles";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import localDateToUtcDate from "../../../utils/localDateToUtcDate";
import moment, { Moment } from "moment";
import LocalizedKeyboardDatePicker, {
	LocalizedKeyboardDatePickerProps,
} from "../../LocalizedDateTimePickers/LocalizedKeyboardDatePicker";

export interface DateInputProps extends TextFieldWithHelpProps {
	/**
	 * The value of the input
	 */
	value: Date | null;
	/**
	 * Set new value of the input
	 * @param date new value
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
	props: DateInputProps & Omit<DatePickerProps<Moment>, "value" | "onChange">,
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

	return (
		<LocalizedKeyboardDatePicker
			{...muiProps}
			value={value ? moment(value) : null}
			onChange={(date) =>
				date ? onChange(localDateToUtcDate(date.toDate())) : onChange(null)
			}
			hideDisabledIcon={hideDisabledIcon}
			required={required}
			error={error}
			fullWidth={fullWidth}
			onBlur={onBlur}
			slots={{
				textField: TextFieldWithHelp,
			}}
			slotProps={{
				...muiProps.slotProps,
				textField: {
					InputLabelProps: InputLabelConfig,
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore This just passes props down to the text field component, TS defs don't support custom props here, but the implementation does.
					customHandleClear: () => onChange(null),
					...muiProps.slotProps?.textField,
				},
			}}
		/>
	);
};

export default React.memo(DateInput);
