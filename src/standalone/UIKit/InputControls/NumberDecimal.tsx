import React, { useCallback } from "react";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import { UIInputProps } from "../CommonStyles";
import { getGlobalized } from "../../../globalize";
import ccI18n from "../../../i18n";

export interface NumberDecimalProps<T> extends UIInputProps {
	/**
	 * Callback method to set entered value
	 */
	setValue: (value: T) => void;
	/**
	 * Callbakc method to return formatted value
	 */
	getValue: (num: number) => void;
	/**
	 * The entered/default value of textfield
	 */
	value?: T;
	onChange?: (newValue: T) => void;
	onBlur?: React.FocusEventHandler;
}

const NumberDecimal = (
	props: NumberDecimalProps<string> & TextFieldWithHelpProps & TextFieldProps
) => {
	const { getValue, setValue, infoText, important, ...muiProps } = props;

	const parseNumber = (s: string) => {
		s = s.replace(/[^\d,.-]/g, ""); // strip everything except numbers, dots, commas and negative sign
		if (
			ccI18n.language.substring(0, 2) !== "de" &&
			/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(s)
		) {
			// if not in German locale and matches #,###.######
			s = s.replace(/,/g, ""); // strip out commas
		} else if (/^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/.test(s)) {
			// either in German locale or not match #,###.###### and now matches #.###,########
			s = s.replace(/\./g, ""); // strip out dots
			s = s.replace(/,/g, "."); // replace comma with dot
		} // try #,###.###### anyway
		else {
			s = s.replace(/,/g, ""); // strip out commas
		}
		return s;
	};
	const handleChange = useCallback(
		async (
			event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
		) => {
			const enteredValue = event.target.value;
			if (enteredValue != "") {
				const numericValue = Number(parseNumber(enteredValue));
				const newValue = (await getGlobalized()).formatNumber(numericValue, {
					minimumFractionDigits: 2,
				});
				setValue(newValue);
				getValue(numericValue);
			} else setValue(enteredValue);
		},
		[getValue, setValue]
	);

	return (
		<div>
			<TextFieldWithHelp
				{...muiProps}
				onFocus={handleChange}
				onChange={handleChange}
				infoText={infoText}
				important={important}
			/>
		</div>
	);
};

export default React.memo(NumberDecimal);
