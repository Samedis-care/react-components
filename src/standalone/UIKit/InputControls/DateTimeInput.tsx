import React from "react";
import { TextFieldProps } from "@mui/material";
import { DateTimePickerProps } from "@mui/x-date-pickers";
import { InputLabelConfig, UIInputProps } from "../CommonStyles";
import LocalizedDateTimePicker from "../../../standalone/LocalizedDateTimePickers/LocalizedDateTimePicker";
import TextFieldWithHelp from "../TextFieldWithHelp";
import accessSlotProps from "../../../utils/internal/accessSlotProps";

export interface DateTimeInputProps extends UIInputProps {
	openInfo?: () => void;
	/**
	 * Set required flag for text field input
	 */
	required?: TextFieldProps["required"];
	/**
	 * Set error flag for text field input
	 */
	error?: TextFieldProps["error"];
	/**
	 * onBlur callback for the text field input
	 */
	onBlur?: TextFieldProps["onBlur"];
	/**
	 * full width?
	 */
	fullWidth?: TextFieldProps["fullWidth"];
}

const DateTimeInput = (props: DateTimeInputProps & DateTimePickerProps) => {
	const {
		openInfo,
		important,
		required,
		error,
		fullWidth,
		onBlur,
		...muiProps
	} = props;

	return (
		<LocalizedDateTimePicker
			{...muiProps}
			slots={{
				textField: TextFieldWithHelp,
				...muiProps.slots,
			}}
			slotProps={{
				...muiProps.slotProps,
				textField: (ownerState) => {
					const orgSlotProps = accessSlotProps(
						ownerState,
						muiProps.slotProps?.textField,
					);
					return {
						// @ts-expect-error custom properties in TextFieldWithHelp
						important,
						required,
						error,
						onBlur,
						fullWidth,
						openInfo,
						...orgSlotProps,
						slotProps: {
							inputLabel: {
								...InputLabelConfig,
								...orgSlotProps?.InputLabelProps,
							},
						},
					} as TextFieldProps;
				},
			}}
		/>
	);
};

export default React.memo(DateTimeInput);
