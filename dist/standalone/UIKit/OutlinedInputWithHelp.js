import React from "react";
import { IconButton, InputAdornment, OutlinedInput } from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import { useInputStyles } from "./CommonStyles";
const OutlinedInputWithHelpInner = (props, ref) => {
    const { openInfo, important, ...muiProps } = props;
    const inputClasses = useInputStyles({ important });
    return (React.createElement(OutlinedInput, { ref: ref, classes: inputClasses, endAdornment: openInfo && (React.createElement(InputAdornment, { position: "end" },
            React.createElement(IconButton, { onClick: openInfo },
                React.createElement(InfoIcon, { color: "disabled" })))), ...muiProps }));
};
const OutlinedInputWithHelp = React.forwardRef(OutlinedInputWithHelpInner);
export default React.memo(OutlinedInputWithHelp);
