import React, { useState } from "react";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp from "../TextFieldWithHelp";
import { UIInputProps } from "../CommonStyles";

export interface NumberIntegerProps extends UIInputProps {
	infoText?: React.ReactNode;
	important?: boolean;
}

const NumberInteger = (props: NumberIntegerProps & TextFieldProps) => {
	const { infoText, important, ...muiProps } = props;
	const [value, setValue] = useState("");

	const onChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		let value = event.target.value as string;
		if (/^[-+]?\d*$/.test(value)) {
			setValue(value);
		} else {
			value = value.slice(0, -1);
			setValue(value);
		}
	};

	return (
		<div>
			<TextFieldWithHelp
				{...muiProps}
				infoText={infoText}
				important={important}
				value={value}
				onChange={onChange}
			/>
		</div>
	);
};

export default React.memo(NumberInteger);
