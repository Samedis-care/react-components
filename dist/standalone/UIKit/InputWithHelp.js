import React from "react";
import { IconButton, InputAdornment } from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import { UiKitInput } from "./CommonStyles";
import useCCTranslations from "../../utils/useCCTranslations";
const InputWithHelpInner = (props, ref) => {
    const { openInfo, important, ...muiProps } = props;
    const { t } = useCCTranslations();
    return (React.createElement(UiKitInput, { ref: ref, important: important, endAdornment: openInfo && (React.createElement(InputAdornment, { position: "end" },
            React.createElement(IconButton, { onClick: openInfo, "aria-label": t("standalone.uikit.info") },
                React.createElement(InfoIcon, { color: "disabled" })))), ...muiProps }));
};
const InputWithHelp = React.forwardRef(InputWithHelpInner);
export default React.memo(InputWithHelp);
