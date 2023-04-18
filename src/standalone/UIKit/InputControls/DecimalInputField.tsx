import React, { useCallback, useState } from "react";
import { TextFieldProps } from "@mui/material";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import {
	getNumberSeparator,
	parseLocalizedNumber,
	useInputCursorFix,
} from "../../../utils";
import useCCTranslations from "../../../utils/useCCTranslations";

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
	const { i18n } = useCCTranslations();
	const { value, onChange, ...muiProps } = props;
	const decimalSeparator = getNumberSeparator("decimal");
	const [danglingDecimalSeparator, setDanglingDecimalSeparator] = useState(
		false
	);
	const valueFormatted =
		value !== null
			? value.toLocaleString(i18n.language) +
			  (danglingDecimalSeparator && !muiProps.disabled ? decimalSeparator : "")
			: "";
	const { handleCursorChange, cursorInputRef } = useInputCursorFix(
		valueFormatted
	);

	// on change handling
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			handleCursorChange(event);
			if (!onChange) return;

			setDanglingDecimalSeparator(
				event.target.value.endsWith(decimalSeparator)
			);
			onChange(event, parseLocalizedNumber(event.target.value));
		},
		[onChange, handleCursorChange, decimalSeparator]
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
