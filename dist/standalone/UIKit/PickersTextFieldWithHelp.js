import React, { useCallback, useState } from "react";
import { IconButton, InputAdornment } from "@mui/material";
import { Clear as ClearIcon, Info as InfoIcon } from "@mui/icons-material";
import { InputLabelConfig, UiKitPickersTextField, } from "./CommonStyles";
import isTouchDevice from "../../utils/isTouchDevice";
import { withMuiWarning } from "./MuiWarning";
export const UiKitPickersTextFieldWithWarnings = withMuiWarning(UiKitPickersTextField);
const TextFieldWithHelp = React.forwardRef(function PickersTextFieldWithHelpInner(props, ref) {
    const { openInfo, customHandleClear, warning, onChange, ...muiProps } = props;
    // handle clear
    const [hasInputValue, setHasInputValue] = useState(!!muiProps.defaultValue);
    const hasValue = muiProps.value == null ? hasInputValue : !!muiProps.value;
    const handleClear = useCallback((evt) => {
        evt.stopPropagation();
        if (customHandleClear) {
            return customHandleClear();
        }
    }, [customHandleClear]);
    // keep "hasValue" up to date
    const handleChange = useCallback((evt) => {
        if (onChange)
            onChange(evt);
        setHasInputValue(!!evt.target.value);
    }, [onChange]);
    // render
    const showClear = isTouchDevice() && hasValue && !muiProps.disabled;
    const hasEndAdornment = !!(showClear ||
        openInfo ||
        muiProps.InputProps?.endAdornment);
    return (React.createElement(UiKitPickersTextFieldWithWarnings, { ref: ref, ...muiProps, warning: warning, onChange: handleChange, InputProps: {
            ...muiProps.InputProps,
            endAdornment: hasEndAdornment ? (React.createElement(React.Fragment, null,
                React.createElement(InputAdornment, { position: "end" },
                    showClear && (React.createElement(IconButton, { onClick: handleClear, size: "small" },
                        React.createElement(ClearIcon, null))),
                    typeof muiProps.InputProps?.endAdornment === "string"
                        ? muiProps.InputProps?.endAdornment
                        : muiProps.InputProps
                            ?.endAdornment?.props?.children,
                    openInfo && (React.createElement(IconButton, { onClick: openInfo, size: "small" },
                        React.createElement(InfoIcon, { color: "disabled" })))))) : undefined,
        }, InputLabelProps: {
            ...InputLabelConfig,
            ...muiProps.InputLabelProps,
        } }));
});
export default React.memo(TextFieldWithHelp);
