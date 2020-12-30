import React from "react";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp from "../TextFieldWithHelp";
import { UIInputProps } from "../CommonStyles";

export interface NumberDecimalProps extends UIInputProps {
	infoText?: React.ReactNode;
	important?: boolean;
}

const NumberDecimal = (props: NumberDecimalProps & TextFieldProps) => {
	const { infoText, important, ...muiProps } = props;

	return (
		<div>
			<TextFieldWithHelp
				{...muiProps}
				infoText={infoText}
				important={important}
				type="number"
			/>
		</div>
	);
};

export default React.memo(NumberDecimal);
