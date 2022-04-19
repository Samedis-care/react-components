import React, { Ref } from "react";
import { IconButton, InputAdornment, Input } from "@material-ui/core";
import { Info as InfoIcon } from "@material-ui/icons";
import { useInputStyles } from "./CommonStyles";
import { InputBaseProps } from "@material-ui/core/InputBase/InputBase";
import { TextFieldWithHelpProps } from "./TextFieldWithHelp";

const InputWithHelpInner = (
	props: TextFieldWithHelpProps & InputBaseProps,
	ref: Ref<unknown>
) => {
	const { openInfo, important, ...muiProps } = props;
	const inputClasses = useInputStyles({ important });

	return (
		<Input
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

const InputWithHelp = React.forwardRef(InputWithHelpInner);

export default React.memo(InputWithHelp);
