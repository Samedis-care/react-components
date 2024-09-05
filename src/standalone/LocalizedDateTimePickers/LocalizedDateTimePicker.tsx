import React from "react";
import {
	DateTimePicker,
	DateTimePickerProps,
	LocalizationProvider,
} from "@mui/x-date-pickers";
import { withMuiWarning } from "../UIKit";
import { Moment } from "moment";
import { TextFieldProps } from "@mui/material";
import useMuiLocaleData from "./useMuiLocaleData";

interface LocalizedDateTimePickerProps
	extends Omit<DateTimePickerProps<Moment>, "format"> {
	/**
	 * Set required flag for text field input
	 */
	required?: TextFieldProps["required"];
	/**
	 * Set error flag for text field input
	 */
	error?: TextFieldProps["error"];
	/**
	 * Set error flag for text field input
	 */
	fullWidth?: TextFieldProps["fullWidth"];
	/**
	 * onBlur callback for the text field input
	 */
	onBlur?: TextFieldProps["onBlur"];
}

const LocalizedDateTimePicker = (props: LocalizedDateTimePickerProps) => {
	const { required, error, fullWidth, onBlur, ...otherProps } = props;
	const localeText = useMuiLocaleData();
	return (
		<LocalizationProvider localeText={localeText}>
			<DateTimePicker
				format={"L LT"}
				{...otherProps}
				slotProps={{
					...otherProps.slotProps,
					textField: {
						required,
						error,
						fullWidth,
						onBlur,
						...otherProps.slotProps?.textField,
					},
				}}
			/>
		</LocalizationProvider>
	);
};

export default React.memo(withMuiWarning(LocalizedDateTimePicker));
