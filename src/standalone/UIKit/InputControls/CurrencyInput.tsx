import React, { useCallback } from "react";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import { parseLocalizedNumber, useInputCursorFix } from "../../../utils";
import ccI18n from "../../../i18n";
import { useTranslation } from "react-i18next";

export interface CurrencyInputProps extends TextFieldWithHelpProps {
	/**
	 * The currency to be used in formatting
	 */
	currency: string;
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

const CurrencyInput = (
	props: CurrencyInputProps & Omit<TextFieldProps, "onChange" | "value">
) => {
	const { value, onChange, currency, ...muiProps } = props;
	const { i18n } = useTranslation(undefined, { i18n: ccI18n });
	const valueFormatted =
		value !== null
			? value.toLocaleString(i18n.language, {
					currency,
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
			  })
			: "";
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

	// component rendering
	return (
		<div>
			<TextFieldWithHelp
				{...muiProps}
				value={valueFormatted}
				onChange={handleChange}
				inputProps={{
					...muiProps.inputProps,
					ref: cursorInputRef,
				}}
			/>
		</div>
	);
};

export default React.memo(CurrencyInput);
