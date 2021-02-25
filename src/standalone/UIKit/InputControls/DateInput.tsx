import React, { useCallback, useEffect, useState } from "react";
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
import moment from "moment";
import { useInputCursorFix } from "../../../utils";
import TypeDate from "../../../backend-integration/Model/Types/TypeDate";
import ccI18n from "../../../i18n";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
export interface DateInputProps extends UIInputProps {
	openInfo?: () => void;
	value: Date | null;
	onChange: (date: Date | null) => void;
}

const DateInput = (
	props: DateInputProps & Omit<DatePickerProps, "value" | "onChange">
) => {
	const {
		value,
		openInfo,
		onError,
		onChange,
		important,
		fullWidth,
		placeholder,
		...muiProps
	} = props;
	const inputClasses = useInputStyles({ important });
	const [isOpen, setIsOpen] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorHelperText, setErrorHelperText] = useState("");
	const [textValue, setTextValue] = useState("");

	// update textValue based on value property
	useEffect(() => {
		if (value === null) {
			setTextValue((old) => (old.includes("_") ? old : ""));
		} else {
			const format = moment()
				.locale(ccI18n.language)
				.localeData()
				.longDateFormat("L");

			let yearStr = value.getFullYear().toString();
			const monthStr = (value.getMonth() + 1).toString();
			const dayStr = value.getDate().toString();
			while (yearStr.length < 4) yearStr = "0" + yearStr;
			const newTextValue = format
				.replace("YYYY", yearStr)
				.replace("MM", monthStr.length === 1 ? "0" + monthStr : monthStr)
				.replace("DD", dayStr.length === 1 ? "0" + dayStr : dayStr);
			setTextValue(newTextValue);
		}
	}, [value]);
	useEffect(() => {
		if (onError && isError) {
			onError(errorHelperText, null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isError]);
	const { handleCursorChange, cursorInputRef } = useInputCursorFix(textValue);
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

			const formatted = TypeDate.format(event.target.value);
			setTextValue(formatted);

			const date = new Date(formatted);
			// If the fields of date are NaN the date is invalid, we should raise an error for this (onError prop)
			if (formatted.includes("_") || isNaN(date.getTime())) {
				setErrorHelperText(
					ccI18n.t(
						"backend-integration.model.types.renderers.date.labels.invalid-date"
					)
				);
				if (!isError) setIsError(true);
			} else {
				setErrorHelperText("");
				setIsError(false);
			}
			onChange(formatted.includes("_") || isNaN(date.getMonth()) ? null : date);
		},
		[isError, setIsError, setErrorHelperText, onChange, handleCursorChange]
	);

	const handlePickerChange = useCallback(
		(newDate: MaterialUiPickersDate) =>
			onChange(newDate ? newDate.toDate() : null),
		[onChange]
	);
	const handlePickerError = useCallback(
		(error: React.ReactNode) => {
			if (error) {
				setErrorHelperText(error as string);
				setIsError(true);
			} else {
				if (!textValue.includes("_")) {
					setIsError(false);
					setErrorHelperText("");
				}
			}
		},
		[textValue, setIsError, setErrorHelperText]
	);
	return (
		<>
			<TextFieldWithHelp
				fullWidth={fullWidth}
				placeholder={placeholder}
				value={textValue}
				error={isError}
				helperText={errorHelperText}
				onChange={handleTextFieldOnChange}
				InputProps={{
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
				inputProps={{
					ref: cursorInputRef,
				}}
				InputLabelProps={InputLabelConfig}
			/>

			<LocalizedDatePicker
				{...muiProps}
				value={value}
				onChange={handlePickerChange}
				clearable
				open={isOpen}
				onError={handlePickerError}
				onOpen={() => setIsOpen(true)}
				onClose={() => setIsOpen(false)}
				TextFieldComponent={() => null}
				InputLabelProps={InputLabelConfig}
			/>
		</>
	);
};

export default React.memo(DateInput);
