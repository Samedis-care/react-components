import React from "react";
import { DatePicker, DatePickerProps } from "@mui/x-date-pickers";
import { TextFieldProps, useTheme } from "@mui/material";
import { withMuiWarning } from "../UIKit";
import { Moment } from "moment";

export interface LocalizedKeyboardDatePickerProps
	extends Omit<DatePickerProps<Moment | null>, "format"> {
	/**
	 * Boolean flag to hide Calendar Icon (only used if disabled is truthy)
	 */
	hideDisabledIcon?: boolean;
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

const LocalizedKeyboardDatePicker = (
	props: LocalizedKeyboardDatePickerProps
) => {
	const {
		hideDisabledIcon,
		required,
		error,
		fullWidth,
		onBlur,
		...otherProps
	} = props;
	const theme = useTheme();
	const hideDisabledIcons =
		hideDisabledIcon ?? theme.componentsCare?.uiKit?.hideDisabledIcons;
	const slotOverrideHideIcon = {
		...otherProps.slots,
		openPickerIcon: React.Fragment,
	};

	return (
		<DatePicker
			format={"L"}
			{...otherProps}
			slots={
				otherProps.disabled && hideDisabledIcons
					? slotOverrideHideIcon
					: otherProps.slots
			}
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
	);
};

export default React.memo(withMuiWarning(LocalizedKeyboardDatePicker));
