import React, { useState } from "react";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp from "../TextFieldWithHelp";
import { UIInputProps } from "../CommonStyles";
import { getGlobalized } from "../../../globalize";

export interface NumberDecimalProps extends UIInputProps {
	infoText?: React.ReactNode;
	important?: boolean;
}

const NumberDecimal = (props: NumberDecimalProps & TextFieldProps) => {
	const { infoText, important, ...muiProps } = props;
	const [number, setNumber] = useState("");

	const handleChange = async (
		event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
	) => {
		let value = event.target.value;
		if (value != "") {
			if (value.split(".").length > 2) {
				value = number;
			}
			const numericValue = Number(value.replace(/[^0-9.]/g, ""));
			const newValue = (await getGlobalized()).formatNumber(numericValue);
			setNumber(newValue);
		} else setNumber(value);
	};

	return (
		<div>
			<TextFieldWithHelp
				{...muiProps}
				value={number}
				infoText={infoText}
				important={important}
				onChange={handleChange}
			/>
		</div>
	);
};

export default React.memo(NumberDecimal);
