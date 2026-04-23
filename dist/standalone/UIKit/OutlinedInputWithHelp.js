import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { IconButton, InputAdornment } from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import { UiKitInputOutlined } from "./CommonStyles";
import useCCTranslations from "../../utils/useCCTranslations";
const OutlinedInputWithHelpInner = (props, ref) => {
    const { openInfo, ...muiProps } = props;
    const { t } = useCCTranslations();
    return (_jsx(UiKitInputOutlined, { ref: ref, endAdornment: openInfo && (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { onClick: openInfo, "aria-label": t("standalone.uikit.info"), children: _jsx(InfoIcon, { color: "disabled" }) }) })), ...muiProps }));
};
const OutlinedInputWithHelp = React.forwardRef(OutlinedInputWithHelpInner);
export default React.memo(OutlinedInputWithHelp);
