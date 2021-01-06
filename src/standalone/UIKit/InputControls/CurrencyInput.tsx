import React, { useState } from "react";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp from "../TextFieldWithHelp";
import { UIInputProps } from "../CommonStyles";
import { getGlobalized } from "../../../globalize";

export interface CurrencyInputProps extends UIInputProps {
	/**
	 * The text for info icon
	 */
	infoText?: React.ReactNode;
	/**
	 * Boolean flag to make css important
	 */
	important?: boolean;
	/**
	 * The currency to be used in formatting
	 */
	currency: string;
}

const CurrencyInput = (props: CurrencyInputProps & TextFieldProps) => {
	const { currency, infoText, important, ...muiProps } = props;
	const [number, setNumber] = useState("");
	const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		let value = event.target.value;
		if (value != "") {
			if (value.split(".").length > 2) {
				value = number;
			}
			const numericValue = Number(value.replace(/[^0-9.]/g, ""));
			const newValue = (await getGlobalized()).formatCurrency(
				numericValue,
				currency || "EUR"
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
				onChange={onChange}
				infoText={infoText}
			/>
		</div>
	);
};

export default React.memo(CurrencyInput);
