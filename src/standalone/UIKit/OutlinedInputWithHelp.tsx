import React from "react";
import { IconButton, InputAdornment } from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import { UiKitInputOutlined } from "./CommonStyles";
import { InputBaseProps } from "@mui/material/InputBase/InputBase";
import { TextFieldWithHelpProps } from "./TextFieldWithHelp";

const OutlinedInputWithHelpInner = (
	props: TextFieldWithHelpProps & InputBaseProps,
	ref: React.Ref<unknown>,
) => {
	const { openInfo, ...muiProps } = props;

	return (
		<UiKitInputOutlined
			ref={ref}
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
