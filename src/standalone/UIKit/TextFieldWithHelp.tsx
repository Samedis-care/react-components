import React, { ForwardedRef } from "react";
import {
	TextField,
	TextFieldProps,
	IconButton,
	InputAdornment,
	InputAdornmentProps,
} from "@material-ui/core";
import { Info as InfoIcon } from "@material-ui/icons";
import { InputLabelConfig, UIInputProps, useInputStyles } from "./CommonStyles";

export interface TextFieldWithHelpProps extends UIInputProps {
	/**
	 * Optional callback which opens a dialog with information about the field
	 */
	openInfo?: () => void;
}

const TextFieldWithHelp = React.forwardRef(function TextFieldWithHelpInner(
	props: TextFieldWithHelpProps & TextFieldProps,
	ref: ForwardedRef<HTMLDivElement>
) {
	const { openInfo, important, ...muiProps } = props;
	const inputClasses = useInputStyles({ important });

	return (
		<TextField
			ref={ref}
			InputLabelProps={InputLabelConfig}
			{...muiProps}
			InputProps={{
				classes: inputClasses,
				...muiProps.InputProps,
				endAdornment: openInfo ? (
					<>
						<InputAdornment position={"end"}>
							{
								(muiProps.InputProps
									?.endAdornment as React.ReactElement<InputAdornmentProps>)
									?.props?.children
							}
							<IconButton onClick={openInfo}>
								<InfoIcon color={"disabled"} />
							</IconButton>
						</InputAdornment>
					</>
				) : (
					muiProps.InputProps?.endAdornment
				),
			}}
		/>
	);
});

export default React.memo(TextFieldWithHelp);
