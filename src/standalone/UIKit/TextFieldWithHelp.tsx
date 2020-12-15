import React from "react";
import { TextField, TextFieldProps, Tooltip } from "@material-ui/core";
import { Info as InfoIcon, Help as HelpIcon } from "@material-ui/icons";
import { InputLabelConfig, useInputStyles } from "./CommonStyles";

export interface TextFieldWithHelpProps {
	helpText?: React.ReactNode;
	infoText?: React.ReactNode;
}

const TextFieldWithHelp = (props: TextFieldWithHelpProps & TextFieldProps) => {
	const inputClasses = useInputStyles();

	return (
		<TextField
			InputProps={{
				classes: inputClasses,
				endAdornment: (
					<>
						{props.infoText && (
							<Tooltip title={props.infoText}>
								<InfoIcon color={"disabled"} />
							</Tooltip>
						)}
						{props.helpText && (
							<Tooltip title={props.helpText}>
								<HelpIcon color={"disabled"} />
							</Tooltip>
						)}
					</>
				),
			}}
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			InputLabelProps={InputLabelConfig}
			{...props}
		/>
	);
};

export default React.memo(TextFieldWithHelp);
