import React from "react";
import { IconButton, InputAdornment, OutlinedInput } from "@material-ui/core";
import { Info as InfoIcon } from "@material-ui/icons";
import { useInputStyles } from "./CommonStyles";
import { InputBaseProps } from "@material-ui/core/InputBase/InputBase";
import { TextFieldWithHelpProps } from "./TextFieldWithHelp";

const OutlinedInputWithHelpInner = (
	props: TextFieldWithHelpProps & InputBaseProps,
	ref: React.Ref<unknown>
) => {
	const { openInfo, important, ...muiProps } = props;
	const inputClasses = useInputStyles({ important });

	return (
		<OutlinedInput
			ref={ref}
			classes={inputClasses}
			endAdornment={
				openInfo && (
					<InputAdornment position={"end"}>
						<IconButton onClick={openInfo}>
							<InfoIcon color={"disabled"} />
						</IconButton>
					</InputAdornment>
				)
			}
			{...muiProps}
		/>
	);
};

const OutlinedInputWithHelp = React.forwardRef(OutlinedInputWithHelpInner);

export default React.memo(OutlinedInputWithHelp);
