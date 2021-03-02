import React from "react";
import { IconButton, InputAdornment, Input } from "@material-ui/core";
import { Info as InfoIcon } from "@material-ui/icons";
import { useInputStyles } from "./CommonStyles";
import { InputBaseProps } from "@material-ui/core/InputBase/InputBase";
import { TextFieldWithHelpProps } from "./TextFieldWithHelp";

const InputWithHelp = React.forwardRef(
	(props: TextFieldWithHelpProps & InputBaseProps, ref) => {
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
	}
);

export default React.memo(InputWithHelp);
