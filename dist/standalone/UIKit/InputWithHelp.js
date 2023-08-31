import React from "react";
import { IconButton, InputAdornment, Input } from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import { useInputStyles } from "./CommonStyles";
const InputWithHelpInner = (props, ref) => {
    const { openInfo, important, ...muiProps } = props;
    const inputClasses = useInputStyles({ important });
    return (React.createElement(Input, { ref: ref, classes: inputClasses, endAdornment: openInfo && (React.createElement(InputAdornment, { position: "end" },
            React.createElement(IconButton, { onClick: openInfo },
                React.createElement(InfoIcon, { color: "disabled" })))), ...muiProps }));
};
const InputWithHelp = React.forwardRef(InputWithHelpInner);
export default React.memo(InputWithHelp);
