import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { IconButton, InputAdornment } from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import { UiKitInput } from "./CommonStyles";
import useCCTranslations from "../../utils/useCCTranslations";
const InputWithHelpInner = (props, ref) => {
    const { openInfo, important, ...muiProps } = props;
    const { t } = useCCTranslations();
    return (_jsx(UiKitInput, { ref: ref, important: important, endAdornment: openInfo && (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { onClick: openInfo, "aria-label": t("standalone.uikit.info"), children: _jsx(InfoIcon, { color: "disabled" }) }) })), ...muiProps }));
};
const InputWithHelp = React.forwardRef(InputWithHelpInner);
export default React.memo(InputWithHelp);
