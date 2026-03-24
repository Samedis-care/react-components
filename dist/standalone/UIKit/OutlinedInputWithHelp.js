import React from "react";
import { IconButton, InputAdornment } from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import { UiKitInputOutlined } from "./CommonStyles";
import useCCTranslations from "../../utils/useCCTranslations";
const OutlinedInputWithHelpInner = (props, ref) => {
    const { openInfo, ...muiProps } = props;
    const { t } = useCCTranslations();
    return (React.createElement(UiKitInputOutlined, { ref: ref, endAdornment: openInfo && (React.createElement(InputAdornment, { position: "end" },
            React.createElement(IconButton, { onClick: openInfo, "aria-label": t("standalone.uikit.info") },
                React.createElement(InfoIcon, { color: "disabled" })))), ...muiProps }));
};
const OutlinedInputWithHelp = React.forwardRef(OutlinedInputWithHelpInner);
export default React.memo(OutlinedInputWithHelp);
