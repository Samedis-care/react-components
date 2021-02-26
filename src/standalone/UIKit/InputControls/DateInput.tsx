import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IconButton, InputAdornment } from "@material-ui/core";
import { DatePickerProps } from "@material-ui/pickers";
import { Info as InfoIcon, Event as CalenderIcon } from "@material-ui/icons";
import { InputLabelConfig, useInputStyles } from "../CommonStyles";
import { LocalizedDatePicker } from "../../../standalone/LocalizedDateTimePickers";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import moment from "moment";
import { useInputCursorFix } from "../../../utils";
import TypeDate from "../../../backend-integration/Model/Types/TypeDate";
import ccI18n from "../../../i18n";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
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
}

const renderTextFieldComponent = () => null;

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
		invalidDateMessage,
		...muiProps
	} = props;
	const inputClasses = useInputStyles({ important });
	const [pickerOpen, setPickerOpen] = useState(false);
	const [error, setError] = useState<React.ReactNode>(null);
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

	// fire on error event
	useEffect(() => {
		if (!onError) return;
		onError(error, value);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [error]);

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
			// If the fields of date are NaN the date is invalid, we raise an error for this
			setError(
				formatted.includes("_") || isNaN(date.getTime())
					? invalidDateMessage ??
							ccI18n.t(
								"backend-integration.model.types.renderers.date.labels.invalid-date"
							)
					: null
			);

			onChange(formatted.includes("_") || isNaN(date.getMonth()) ? null : date);
		},
		[handleCursorChange, onChange, invalidDateMessage]
	);

	const handlePickerChange = useCallback(
		(newDate: MaterialUiPickersDate) =>
			onChange(newDate ? newDate.toDate() : null),
		[onChange]
	);

	const handleOpen = useCallback(() => setPickerOpen(true), [setPickerOpen]);
	const handleClose = useCallback(() => setPickerOpen(false), [setPickerOpen]);

	const InputProps = useMemo(
		() => ({
			classes: inputClasses,
			endAdornment: (
				<InputAdornment position="end">
					{!muiProps.disabled && (
						<IconButton onClick={handleOpen}>
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
		}),
		[handleOpen, handleOpenInfo, inputClasses, muiProps.disabled, openInfo]
	);

	const inputProps = useMemo(
		() => ({
			ref: cursorInputRef,
		}),
		[cursorInputRef]
	);

	return (
		<>
			<TextFieldWithHelp
				fullWidth={fullWidth}
				placeholder={placeholder}
				value={textValue}
				error={!!error}
				helperText={error}
				onChange={handleTextFieldOnChange}
				InputProps={InputProps}
				inputProps={inputProps}
				InputLabelProps={InputLabelConfig}
			/>

			<LocalizedDatePicker
				{...muiProps}
				value={value}
				onChange={handlePickerChange}
				clearable
				open={pickerOpen}
				onError={setError}
				onOpen={handleOpen}
				onClose={handleClose}
				TextFieldComponent={renderTextFieldComponent}
				InputLabelProps={InputLabelConfig}
			/>
		</>
	);
};

export default React.memo(DateInput);
