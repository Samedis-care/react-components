import React, { Ref } from "react";
import { IconButton, InputAdornment } from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import { UiKitInput } from "./CommonStyles";
import { InputBaseProps } from "@mui/material/InputBase";
import { TextFieldWithHelpProps } from "./TextFieldWithHelp";
import useCCTranslations from "../../utils/useCCTranslations";

const InputWithHelpInner = (
	props: TextFieldWithHelpProps & InputBaseProps,
	ref: Ref<unknown>,
) => {
	const { openInfo, important, ...muiProps } = props;
	const { t } = useCCTranslations();

	return (
		<UiKitInput
			ref={ref}
			important={important}
			endAdornment={
				openInfo && (
					<InputAdornment position={"end"}>
						<IconButton
							onClick={openInfo}
							aria-label={t("standalone.uikit.info")}
						>
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
