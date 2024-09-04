import React from "react";
import {
	DatePicker,
	DatePickerProps,
	LocalizationProvider,
} from "@mui/x-date-pickers";
import { TextFieldProps, useThemeProps } from "@mui/material";
import { withMuiWarning } from "../UIKit/MuiWarning";
import { Moment } from "moment";
import useMuiLocaleData from "./useMuiLocaleData";

export interface LocalizedKeyboardDatePickerProps
	extends Omit<DatePickerProps<Moment>, "format"> {
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

export type LocalizedKeyboardDatePickerClassKey = never;

const LocalizedKeyboardDatePicker = (
	inProps: LocalizedKeyboardDatePickerProps,
) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcLocalizedKeyboardDatePicker",
	});
	const {
		hideDisabledIcon,
		required,
		error,
		fullWidth,
		onBlur,
		...otherProps
	} = props;
	const slotOverrideHideIcon = {
		...otherProps.slots,
		openPickerIcon: React.Fragment,
	};
	const localeText = useMuiLocaleData();

	return (
		<LocalizationProvider localeText={localeText}>
			<DatePicker
				format={"L"}
				{...otherProps}
				slots={
					otherProps.disabled && hideDisabledIcon
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
		</LocalizationProvider>
	);
};

export default React.memo(withMuiWarning(LocalizedKeyboardDatePicker));
