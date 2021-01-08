import React, { useCallback } from "react";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import { UIInputProps } from "../CommonStyles";
import { getGlobalized } from "../../../globalize";

export interface NumberIntegerProps<T> extends UIInputProps {
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

const NumberInteger = (
	props: NumberIntegerProps<string> & TextFieldWithHelpProps & TextFieldProps
) => {
	const { getValue, setValue, infoText, important, ...muiProps } = props;

	const handleChange = useCallback(
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

export default React.memo(NumberInteger);
