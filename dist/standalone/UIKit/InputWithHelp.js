import React from "react";
import { IconButton, InputAdornment } from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import { UiKitInput } from "./CommonStyles";
const InputWithHelpInner = (props, ref) => {
    const { openInfo, important, ...muiProps } = props;
    return (React.createElement(UiKitInput, { ref: ref, important: important, endAdornment: openInfo && (React.createElement(InputAdornment, { position: "end" },
            React.createElement(IconButton, { onClick: openInfo },
                React.createElement(InfoIcon, { color: "disabled" })))), ...muiProps }));
};
const InputWithHelp = React.forwardRef(InputWithHelpInner);
export default React.memo(InputWithHelp);
