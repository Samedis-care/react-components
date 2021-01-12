import React, { useState, useEffect, useCallback } from "react";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import { getGlobalized } from "../../../globalize";
import Globalize from "globalize/dist/globalize";
import ccI18n from "../../../i18n";
import { getSeparator, getDecimalSeparator } from "../../../utils";

export interface NumberDecimalProps extends TextFieldWithHelpProps {
	/**
	 * Callbakc method to return formatted value
	 */
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

const NumberDecimal = (
	props: NumberDecimalProps & Omit<TextFieldProps, "onChange" | "value">
) => {
	const { value, onChange, ...muiProps } = props;

	// globalized handling
	const [globalized, setGlobalized] = useState<Globalize | null>(null);
	useEffect(() => {
		const updateGlobalized = () =>
			void (async () => {
				setGlobalized(await getGlobalized());
			})();
		// initial load
		updateGlobalized();

		// listen for locale switches
		ccI18n.on("languageChanged", updateGlobalized);
		return () => {
			ccI18n.off("languageChanged", updateGlobalized);
		};
	}, []);

	// on change handling
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			if (!onChange) return;

			const num = event.target.value;
			if (num != "") {
				let parsedValue = num
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
						parsedValue = String(value);
					const numericValue = parseInt(parsedValue);
					onChange(event, numericValue);
				} else {
					onChange(event, null);
				}
			} else {
				onChange(event, null);
			}
		},
		[onChange, value]
	);

	return (
		<div>
			<TextFieldWithHelp
				{...muiProps}
				value={
					value !== null && globalized
						? globalized.formatNumber(value, {
								minimumFractionDigits: 2,
						  })
						: ""
				}
				onFocus={handleChange}
				onChange={handleChange}
			/>
		</div>
	);
};

export default React.memo(NumberDecimal);
