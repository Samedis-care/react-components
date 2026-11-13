import React from "react";
import {
	DateTimePickerProps,
	PickersTextFieldProps,
} from "@mui/x-date-pickers";
import { UIInputProps } from "../CommonStyles";
import LocalizedDateTimePicker, {
	LocalizedDateTimePickerProps,
} from "../../../standalone/LocalizedDateTimePickers/LocalizedDateTimePicker";
import accessSlotProps from "../../../utils/internal/accessSlotProps";
import PickersTextFieldWithHelp from "../PickersTextFieldWithHelp";

export interface DateTimeInputProps extends UIInputProps {
	openInfo?: () => void;
	/**
	 * Set required flag for text field input
	 */
	required?: LocalizedDateTimePickerProps["required"];
	/**
	 * Set error flag for text field input
	 */
	error?: LocalizedDateTimePickerProps["error"];
	/**
	 * onBlur callback for the text field input
	 */
	onBlur?: LocalizedDateTimePickerProps["onBlur"];
	/**
	 * full width?
	 */
	fullWidth?: LocalizedDateTimePickerProps["fullWidth"];
	/**
	 * Text below the field: a hint, or the message of a validation error or warning
	 * @remarks The field group's description (`aria-describedby`), so a screen reader
	 *          reads it when the user reaches the field; its color follows `error` and
	 *          `warning`. Takes the place of `slotProps.textField.helperText`, which is
	 *          used while this is undefined. Default: none.
	 */
	helperText?: PickersTextFieldProps["helperText"];
}

const DateTimeInput = (props: DateTimeInputProps & DateTimePickerProps) => {
	const {
		openInfo,
		important,
		required,
		error,
		fullWidth,
		onBlur,
		helperText,
		...muiProps
	} = props;

	return (
		<LocalizedDateTimePicker
			{...muiProps}
			// the picker owns these four: it builds the text field slot props itself, so
			// passing them down through slotProps.textField would be overwritten there
			required={required}
			error={error}
			fullWidth={fullWidth}
			onBlur={onBlur}
			slots={{
				textField: PickersTextFieldWithHelp,
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
						openInfo,
						...orgSlotProps,
						// only where the caller gave one, so a helper text passed through
						// slotProps.textField is not overwritten with undefined
						...(helperText === undefined ? {} : { helperText }),
					} as PickersTextFieldProps;
				},
			}}
		/>
	);
};

export default React.memo(DateTimeInput);
