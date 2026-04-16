import React, { useCallback, useState } from "react";
import { IconButton, InputAdornment } from "@mui/material";
import { Clear as ClearIcon, Info as InfoIcon } from "@mui/icons-material";
import { InputLabelConfig, UiKitPickersTextField, } from "./CommonStyles";
import isTouchDevice from "../../utils/isTouchDevice";
import { withMuiWarning } from "./MuiWarning";
import useCCTranslations from "../../utils/useCCTranslations";
export const UiKitPickersTextFieldWithWarnings = withMuiWarning(UiKitPickersTextField);
const TextFieldWithHelp = React.forwardRef(function PickersTextFieldWithHelpInner(props, ref) {
    const { openInfo, customHandleClear, disableClearable, warning, onChange, ...muiProps } = props;
    const { t } = useCCTranslations();
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
    const inputSlotProps = muiProps.slotProps?.input;
    const existingEndAdornment = inputSlotProps?.endAdornment;
    const showClear = isTouchDevice() && hasValue && !muiProps.disabled && !disableClearable;
    const hasEndAdornment = !!(showClear || openInfo || existingEndAdornment);
    return (React.createElement(UiKitPickersTextFieldWithWarnings, { ref: ref, ...muiProps, warning: warning, onChange: handleChange, slotProps: {
            ...muiProps.slotProps,
            input: {
                ...inputSlotProps,
                endAdornment: hasEndAdornment ? (React.createElement(React.Fragment, null,
                    React.createElement(InputAdornment, { position: "end" },
                        showClear && (React.createElement(IconButton, { onClick: handleClear, size: "small", "aria-label": t("standalone.uikit.clear") },
                            React.createElement(ClearIcon, null))),
                        typeof existingEndAdornment === "string"
                            ? existingEndAdornment
                            : existingEndAdornment?.props?.children,
                        openInfo && (React.createElement(IconButton, { onClick: openInfo, size: "small", "aria-label": t("standalone.uikit.info") },
                            React.createElement(InfoIcon, { color: "disabled" })))))) : undefined,
            },
            inputLabel: {
                ...InputLabelConfig,
                ...muiProps.slotProps?.inputLabel,
            },
        } }));
});
export default React.memo(TextFieldWithHelp);
