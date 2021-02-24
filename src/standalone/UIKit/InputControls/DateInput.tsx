import React, { useCallback, useState } from "react";
import { IconButton, InputAdornment } from "@material-ui/core";
import { DatePickerProps } from "@material-ui/pickers";
import { Info as InfoIcon, Event as CalenderIcon } from "@material-ui/icons";
import {
	InputLabelConfig,
	UIInputProps,
	useInputStyles,
} from "../CommonStyles";
import { LocalizedDatePicker } from "../../../standalone/LocalizedDateTimePickers";
import TextFieldWithHelp from "../TextFieldWithHelp";
import ccI18n from "../../../i18n";
import moment from "moment";
import { useInputCursorFix } from "../../../utils";
export interface DateInputProps extends UIInputProps {
	openInfo?: () => void;
}

const DateInput = (props: DateInputProps & DatePickerProps) => {
	const {
		value,
		openInfo,
		onChange,
		important,
		fullWidth,
		placeholder,
		...muiProps
	} = props;
	const inputClasses = useInputStyles({ important });
	const [isOpen, setIsOpen] = useState(false);
	const valueFormatted = value
		? new Date(value as Date).toLocaleDateString(ccI18n.language)
		: "";
	const { handleCursorChange, cursorInputRef } = useInputCursorFix(
		valueFormatted
	);
	const handleOpenInfo = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			// Prevent calender popup open event, while clicking on info icon
			event.stopPropagation();
			if (openInfo) openInfo();
		},
		[openInfo]
	);
	const handleTextFieldOnChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			handleCursorChange(event);

			if (!onChange) return;
			const momentDate = moment(event.target.value);
			onChange(momentDate);
		},
		[onChange, handleCursorChange]
	);

	return (
		<>
			<TextFieldWithHelp
				fullWidth={fullWidth}
				placeholder={placeholder}
				type="text"
				value={valueFormatted}
				onChange={handleTextFieldOnChange}
				InputProps={{
					ref: cursorInputRef,
					classes: inputClasses,
					endAdornment: (
						<InputAdornment position="end">
							{!muiProps.disabled && (
								<IconButton onClick={() => setIsOpen(true)}>
									<CalenderIcon color={"disabled"} />
								</IconButton>
							)}
							{openInfo && (
								<IconButton onClick={handleOpenInfo}>
									<InfoIcon color={"disabled"} />
								</IconButton>
							)}
						</InputAdornment>
					),
				}}
				InputLabelProps={InputLabelConfig}
			/>

			<LocalizedDatePicker
				{...muiProps}
				value={value}
				onChange={onChange}
				clearable
				open={isOpen}
				onOpen={() => setIsOpen(true)}
				onClose={() => setIsOpen(false)}
				TextFieldComponent={() => null}
				InputLabelProps={InputLabelConfig}
			/>
		</>
	);
};

export default React.memo(DateInput);
