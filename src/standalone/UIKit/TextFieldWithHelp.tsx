import React from "react";
import { TextField, TextFieldProps, Tooltip } from "@material-ui/core";
import { Info as InfoIcon } from "@material-ui/icons";
import { InputLabelConfig, UIInputProps, useInputStyles } from "./CommonStyles";

export interface TextFieldWithHelpProps extends UIInputProps {
	infoText?: React.ReactNode;
	type?: string;
}

const TextFieldWithHelp = (props: TextFieldWithHelpProps & TextFieldProps) => {
	const { infoText, important, type, ...muiProps } = props;
	const inputClasses = useInputStyles({ important });

	return (
		<TextField
			InputProps={{
				classes: inputClasses,
				endAdornment: infoText && (
					<Tooltip title={infoText}>
						<InfoIcon color={"disabled"} />
					</Tooltip>
				),
			}}
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			InputLabelProps={InputLabelConfig}
			{...muiProps}
			type={type}
		/>
	);
};

export default React.memo(TextFieldWithHelp);
