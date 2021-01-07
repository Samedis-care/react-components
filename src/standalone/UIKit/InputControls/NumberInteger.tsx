import React, { useCallback } from "react";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp from "../TextFieldWithHelp";
import { UIInputProps } from "../CommonStyles";
import { getGlobalized } from "../../../globalize";

export interface NumberIntegerProps extends UIInputProps {
	/**
	 * The text for info icon
	 */
	infoText?: React.ReactNode;
	/**
	 * The text for info icon
	 */
	important?: boolean;
	/**
	 * The entered/default value of textfield
	 */
	value: string;
	/**
	 * Callback method to set entered value
	 */
	setValue: (value: string) => void;
	/**
	 * Callbakc method to return formatted value
	 */
	getValue: (num: number) => void;
}

const NumberInteger = (props: NumberIntegerProps & TextFieldProps) => {
	const { value, getValue, setValue, infoText, important, ...muiProps } = props;

	const updateValue = useCallback(
		async (
			event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
		) => {
			const num = event.target.value;
			if (num != "") {
				const numericValue = Number(num.replace(/[^0-9]/g, ""));
				const newValue = (await getGlobalized()).formatNumber(numericValue);
				setValue(newValue);
				getValue(numericValue);
			} else setValue(num);
		},
		[getValue, setValue]
	);
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			return updateValue(event);
		},
		[updateValue]
	);

	return (
		<div>
			<TextFieldWithHelp
				{...muiProps}
				value={value}
				onFocus={updateValue}
				onChange={handleChange}
				infoText={infoText}
				important={important}
			/>
		</div>
	);
};

export default React.memo(NumberInteger);
