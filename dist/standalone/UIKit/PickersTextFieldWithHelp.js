import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
    return (_jsx(UiKitPickersTextFieldWithWarnings, { ref: ref, ...muiProps, warning: warning, onChange: handleChange, slotProps: {
            ...muiProps.slotProps,
            input: {
                ...inputSlotProps,
                endAdornment: hasEndAdornment ? (_jsx(_Fragment, { children: _jsxs(InputAdornment, { position: "end", children: [showClear && (_jsx(IconButton, { onClick: handleClear, size: "small", "aria-label": t("standalone.uikit.clear"), children: _jsx(ClearIcon, {}) })), typeof existingEndAdornment === "string"
                                ? existingEndAdornment
                                : existingEndAdornment?.props?.children, openInfo && (_jsx(IconButton, { onClick: openInfo, size: "small", "aria-label": t("standalone.uikit.info"), children: _jsx(InfoIcon, { color: "disabled" }) }))] }) })) : undefined,
            },
            inputLabel: {
                ...InputLabelConfig,
                ...muiProps.slotProps?.inputLabel,
            },
        } }));
});
export default React.memo(TextFieldWithHelp);
