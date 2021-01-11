import React, { useState, useCallback } from "react";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import { UIInputProps } from "../CommonStyles";
import { getGlobalized } from "../../../globalize";
import ccI18n from "../../../i18n";

export interface NumberDecimalProps<T> extends UIInputProps {
	/**
	 * Callbakc method to return formatted value
	 */
	getValue: (num: number) => void;
	/**
	 * The entered/default value of textfield
	 */
	value: number | null;
	onChange?: (newValue: T) => void;
	onBlur?: React.FocusEventHandler;
}

const NumberDecimal = (
	props: NumberDecimalProps<string> & TextFieldWithHelpProps & TextFieldProps
) => {
	const { getValue, value, infoText, important, ...muiProps } = props;
	const [formattedNumber, setFormattedNumber] = useState(
		(value as unknown) as string
	);

	const getSeparator = (separatorType: string) => {
		const format = Intl.NumberFormat(ccI18n.language)
			.formatToParts(1000.11)
			.find((part) => part.type === separatorType);
		return format === undefined ? "," : format.value;
	};

	const getDecimalSeparator = () => {
		const numberWithDecimalSeparator = 1.1;

		return numberWithDecimalSeparator
			.toLocaleString(ccI18n.language)
			.substring(1, 2);
	};
	const handleChange = useCallback(
		async (
			event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
		) => {
			const enteredValue = event.target.value;
			const globalized = await getGlobalized();
			if (enteredValue != "") {
				let parsedValue = enteredValue
					.replace(/[^0-9.,-]/g, "")
					.split(getSeparator("group"))
					.join("");
				if (parsedValue) {
					if (
						parsedValue === getSeparator("group") ||
						parsedValue === getDecimalSeparator()
					)
						parsedValue = "0";
					else if (parsedValue.split(getDecimalSeparator()).length > 2)
						parsedValue = (value as unknown) as string;

					const numericValue = Number(globalized.parseNumber(parsedValue));
					const newValue = globalized.formatNumber(numericValue, {
						minimumFractionDigits: 2,
					});
					setFormattedNumber(newValue);
					getValue(numericValue);
				} else setFormattedNumber("");
			} else setFormattedNumber(enteredValue);
		},
		[getValue, setFormattedNumber, value]
	);

	return (
		<div>
			<TextFieldWithHelp
				{...muiProps}
				value={formattedNumber}
				onFocus={handleChange}
				onChange={handleChange}
				infoText={infoText}
				important={important}
			/>
		</div>
	);
};

export default React.memo(NumberDecimal);
