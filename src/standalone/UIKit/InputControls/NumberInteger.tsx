import React, { useState, useCallback } from "react";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import { UIInputProps } from "../CommonStyles";
import { getGlobalized } from "../../../globalize";

export interface NumberIntegerProps extends UIInputProps {
	/**
	 * Callbakc method to return formatted value
	 */
	getValue: (num: number | null) => void;
	/**
	 * The entered/default value of textfield
	 */
	value?: number | null;
	onChange?: (newValue: number | null) => void;
	onBlur?: React.FocusEventHandler;
}

const NumberInteger = (
	props: NumberIntegerProps & TextFieldWithHelpProps & TextFieldProps
) => {
	const { getValue, value, infoText, important, ...muiProps } = props;
	const [formattedNumber, setFormattedNumber] = useState(
		(value as unknown) as string
	);

	const handleChange = useCallback(
		async (
			event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
		) => {
			const num = event.target.value;
			if (num != "") {
				const numericValue = Number(num.replace(/[^0-9]/g, ""));
				setFormattedNumber((await getGlobalized()).formatNumber(numericValue));
				getValue(numericValue);
			} else setFormattedNumber("");
		},
		[getValue]
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

export default React.memo(NumberInteger);
