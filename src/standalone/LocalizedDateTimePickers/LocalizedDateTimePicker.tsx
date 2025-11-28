import React from "react";
import {
	DateTimePicker,
	DateTimePickerProps,
	LocalizationProvider,
	PickersTextFieldProps,
} from "@mui/x-date-pickers";
import { withMuiWarning } from "../UIKit";
import { TextFieldProps } from "@mui/material";
import useMuiLocaleData from "./useMuiLocaleData";
import accessSlotProps from "../../utils/internal/accessSlotProps";

interface LocalizedDateTimePickerProps extends Omit<
	DateTimePickerProps,
	"format"
> {
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
	onBlur?: TextFieldProps["onBlur"] & PickersTextFieldProps["onBlur"];
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
					textField: (ownerState) => {
						const orgSlotProps = accessSlotProps(
							ownerState,
							otherProps.slotProps?.textField,
						);
						return {
							required,
							error,
							fullWidth,
							onBlur,
							...orgSlotProps,
						};
					},
				}}
			/>
		</LocalizationProvider>
	);
};

export default React.memo(withMuiWarning(LocalizedDateTimePicker));
