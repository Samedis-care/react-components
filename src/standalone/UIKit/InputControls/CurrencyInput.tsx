import React, { useState } from "react";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import { UIInputProps } from "../CommonStyles";
import { getGlobalized } from "../../../globalize";

export interface CurrencyInputProps extends UIInputProps {
	/**
	 * The currency to be used in formatting
	 */
	currency: string;
	value?: number | null;
	onChange?: (newValue: number | null) => void;
	onBlur?: React.FocusEventHandler;
}

const CurrencyInput = (
	props: CurrencyInputProps & TextFieldWithHelpProps & TextFieldProps
) => {
	const { currency, infoText, important, ...muiProps } = props;
	const [number, setNumber] = useState("");
	const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		let value = event.target.value;
		if (value != "") {
			if (value.split(".").length > 2) {
				value = number;
			}
			const numericValue = Number(value.replace(/[^0-9.]/g, ""));
			const newValue = (await getGlobalized()).formatCurrency(
				numericValue,
				currency
			);
			setNumber(newValue);
		} else setNumber(value);
	};

	return (
		<div>
			<TextFieldWithHelp
				{...muiProps}
				autoFocus
				important={important}
				value={number}
				onChange={handleChange}
				infoText={infoText}
			/>
		</div>
	);
};

export default React.memo(CurrencyInput);
