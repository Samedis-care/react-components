import React, { useCallback } from "react";
import { IconButton, InputAdornment, TextFieldProps } from "@mui/material";
import { DateTimePickerProps } from "@mui/x-date-pickers";
import { Info as InfoIcon, Event as CalenderIcon } from "@mui/icons-material";
import { InputLabelConfig, UIInputProps } from "../CommonStyles";
import LocalizedDateTimePicker from "../../../standalone/LocalizedDateTimePickers/LocalizedDateTimePicker";
import { Moment } from "moment";
import TextFieldWithHelp from "../TextFieldWithHelp";

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
}

const DateTimeInput = (
	props: DateTimeInputProps & DateTimePickerProps<Moment | null>,
) => {
	const { openInfo, important, required, error, onBlur, ...muiProps } = props;

	const handleOpenInfo = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			// Prevent calendar popup open event, while clicking on info icon
			event.stopPropagation();
			if (openInfo) openInfo();
		},
		[openInfo],
	);

	return (
		<LocalizedDateTimePicker
			{...muiProps}
			slots={{
				textField: TextFieldWithHelp,
				...muiProps.slots,
			}}
			slotProps={{
				...muiProps.slotProps,
				textField: {
					// @ts-expect-error custom property for slot
					important,
					required,
					error,
					onBlur,
					InputProps: {
						endAdornment: (
							<InputAdornment position="end">
								{!muiProps.disabled && (
									<IconButton size="large">
										<CalenderIcon color={"disabled"} />
									</IconButton>
								)}
								{openInfo && (
									<IconButton onClick={handleOpenInfo} size="large">
										<InfoIcon color={"disabled"} />
									</IconButton>
								)}
							</InputAdornment>
						),
					},
					InputLabelProps: InputLabelConfig,
					...muiProps.slotProps?.textField,
				},
			}}
		/>
	);
};

export default React.memo(DateTimeInput);
