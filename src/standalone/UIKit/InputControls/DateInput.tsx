import React from "react";
import { TextFieldProps } from "@material-ui/core";
import { KeyboardDatePickerProps } from "@material-ui/pickers";
import { InputLabelConfig } from "../CommonStyles";
import { LocalizedKeyboardDatePicker } from "../../../standalone/LocalizedDateTimePickers";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import { localDateToUtcDate } from "../../../utils";

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
}

const CustomInput = React.forwardRef<HTMLDivElement>(
	function DateInputCustomTextField(props: TextFieldProps, ref) {
		return <TextFieldWithHelp {...props} ref={ref} />;
	}
);

const DateInput = (
	props: DateInputProps & Omit<KeyboardDatePickerProps, "value" | "onChange">
) => {
	const { value, onChange, hideDisabledIcon, ...muiProps } = props;

	return (
		<LocalizedKeyboardDatePicker
			{...muiProps}
			value={value}
			onChange={(date) =>
				date ? onChange(localDateToUtcDate(date.toDate())) : onChange(null)
			}
			clearable
			hideDisabledIcon={hideDisabledIcon}
			TextFieldComponent={CustomInput}
			InputLabelProps={InputLabelConfig}
		/>
	);
};

export default React.memo(DateInput);
