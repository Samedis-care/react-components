import React, { useState, useCallback, useEffect } from "react";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import { getGlobalized } from "../../../globalize";
import Globalize from "globalize/dist/globalize";
import ccI18n from "../../../i18n";

export interface NumberIntegerProps extends TextFieldWithHelpProps {
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

const NumberInteger = (
	props: NumberIntegerProps & Omit<TextFieldProps, "onChange" | "value">
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

			const num = event.target.value.replace(/[^0-9]/g, "");
			if (num != "") {
				const numericValue = parseInt(num);
				onChange(event, numericValue);
			} else {
				onChange(event, null);
			}
		},
		[onChange]
	);

	// component rendering
	return (
		<div>
			<TextFieldWithHelp
				{...muiProps}
				value={
					value !== null && globalized ? globalized.formatNumber(value) : ""
				}
				onFocus={handleChange}
				onChange={handleChange}
			/>
		</div>
	);
};

export default React.memo(NumberInteger);
