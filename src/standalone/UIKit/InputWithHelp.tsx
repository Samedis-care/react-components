import React, { Ref } from "react";
import { IconButton, InputAdornment } from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import { UiKitInput } from "./CommonStyles";
import { InputBaseProps } from "@mui/material/InputBase/InputBase";
import { TextFieldWithHelpProps } from "./TextFieldWithHelp";

const InputWithHelpInner = (
	props: TextFieldWithHelpProps & InputBaseProps,
	ref: Ref<unknown>,
) => {
	const { openInfo, important, ...muiProps } = props;

	return (
		<UiKitInput
			ref={ref}
			important={important}
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
