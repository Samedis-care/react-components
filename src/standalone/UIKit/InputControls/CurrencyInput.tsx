import React, { useCallback } from "react";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import { delocalizeNumber, useGlobalized } from "../../../utils";

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
	const globalized = useGlobalized();

	// on change handling
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			if (!onChange) return;

			const num = delocalizeNumber(event.target.value);
			if (num !== "") {
				onChange(event, parseFloat(num));
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
					value !== null && globalized
						? globalized.formatCurrency(value, currency)
						: ""
				}
				onFocus={handleChange}
				onChange={handleChange}
			/>
		</div>
	);
};

export default React.memo(CurrencyInput);
