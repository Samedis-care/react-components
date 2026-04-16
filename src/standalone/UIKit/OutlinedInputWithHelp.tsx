import React from "react";
import { IconButton, InputAdornment } from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import { UiKitInputOutlined } from "./CommonStyles";
import { InputBaseProps } from "@mui/material/InputBase";
import { TextFieldWithHelpProps } from "./TextFieldWithHelp";
import useCCTranslations from "../../utils/useCCTranslations";

const OutlinedInputWithHelpInner = (
	props: TextFieldWithHelpProps & InputBaseProps,
	ref: React.Ref<unknown>,
) => {
	const { openInfo, ...muiProps } = props;
	const { t } = useCCTranslations();

	return (
		<UiKitInputOutlined
			ref={ref}
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

const OutlinedInputWithHelp = React.forwardRef(OutlinedInputWithHelpInner);

export default React.memo(OutlinedInputWithHelp);
