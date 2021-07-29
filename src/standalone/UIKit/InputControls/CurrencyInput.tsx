import React, { useCallback, useState } from "react";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import {
	delocalizeNumber,
	parseLocalizedNumber,
	useInputCursorFix,
} from "../../../utils";
import useCCTranslations from "../../../utils/useCCTranslations";

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
	const { i18n } = useCCTranslations();
	const [valueFormatted, setValueFormatted] = useState<string>(
		value !== null
			? value.toLocaleString(i18n.language, {
					currency,
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
			  })
			: ""
	);
	const { handleCursorChange, cursorInputRef } = useInputCursorFix(
		valueFormatted
	);

	const handleClear = useCallback(() => {
		setValueFormatted("");
	}, []);

	// on change handling
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			if (event.target.value === "") handleClear();
			else {
				setValueFormatted(
					parseFloat(delocalizeNumber(event.target.value)).toLocaleString(
						i18n.language
					)
				);
			}
			handleCursorChange(event);
			if (!onChange) return;

			onChange(event, parseLocalizedNumber(event.target.value));
		},
		[handleClear, handleCursorChange, onChange, i18n.language]
	);

	// component rendering
	return (
		<div>
			<TextFieldWithHelp
				{...muiProps}
				valueFormatted={valueFormatted}
				onChange={handleChange}
				onClear={handleClear}
				inputProps={{
					...muiProps.inputProps,
					ref: cursorInputRef,
				}}
			/>
		</div>
	);
};

export default React.memo(CurrencyInput);
