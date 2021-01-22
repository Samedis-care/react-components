import React, { useCallback } from "react";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import {
	parseLocalizedNumber,
	useGlobalized,
	useInputCursorFix,
} from "../../../utils";

export interface DecimalInputFieldProps extends TextFieldWithHelpProps {
	/**
	 * The current value or null if not set
	 */
	value: number | null;
	/**
	 * The change event handler
	 * @param evt
	 * @param value
	 */
	onChange?: (
		evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
		value: number | null
	) => void;
}

const DecimalInputField = (
	props: DecimalInputFieldProps & Omit<TextFieldProps, "onChange" | "value">
) => {
	const { value, onChange, ...muiProps } = props;
	const globalized = useGlobalized();
	const valueFormatted =
		value !== null && globalized ? globalized.formatNumber(value) : "";
	const { handleCursorChange, cursorInputRef } = useInputCursorFix(
		valueFormatted
	);

	// on change handling
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			handleCursorChange(event);
			if (!onChange) return;

			onChange(event, parseLocalizedNumber(event.target.value));
		},
		[onChange, handleCursorChange]
	);

	return (
		<TextFieldWithHelp
			{...muiProps}
			value={valueFormatted}
			onChange={handleChange}
			inputProps={{
				...muiProps.inputProps,
				ref: cursorInputRef,
			}}
		/>
	);
};

export default React.memo(DecimalInputField);
