import React from "react";
import { TextFieldProps } from "@material-ui/core";
import { KeyboardDatePickerProps } from "@material-ui/pickers";
import { InputLabelConfig } from "../CommonStyles";
import { LocalizedKeyboardDatePicker } from "../../../standalone/LocalizedDateTimePickers";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";

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
}

const CustomInput = React.forwardRef<HTMLDivElement>(
	function DateInputCustomTextField(props: TextFieldProps, ref) {
		return <TextFieldWithHelp {...props} ref={ref} />;
	}
);

const DateInput = (
	props: DateInputProps & Omit<KeyboardDatePickerProps, "value" | "onChange">
) => {
	const { value, onChange, ...muiProps } = props;

	return (
		<LocalizedKeyboardDatePicker
			{...muiProps}
			value={value}
			onChange={(date) => (date ? onChange(date.toDate()) : onChange(null))}
			clearable
			TextFieldComponent={CustomInput}
			InputLabelProps={InputLabelConfig}
		/>
	);
};

export default React.memo(DateInput);
