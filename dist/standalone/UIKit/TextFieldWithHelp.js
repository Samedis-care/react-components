import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useCallback, useEffect, useRef, useState, } from "react";
import { IconButton, InputAdornment, } from "@mui/material";
import { Clear as ClearIcon, Info as InfoIcon } from "@mui/icons-material";
import { InputLabelConfig, UiKitTextField } from "./CommonStyles";
import isTouchDevice from "../../utils/isTouchDevice";
import { withMuiWarning } from "./MuiWarning";
import useCCTranslations from "../../utils/useCCTranslations";
import { useRefComposer } from "react-ref-composer";
import accessSlotProps from "../../utils/internal/accessSlotProps";
export const UiKitTextFieldWithWarnings = withMuiWarning(UiKitTextField);
const TextFieldWithHelp = React.forwardRef(function TextFieldWithHelpInner(props, ref) {
    const { openInfo, customHandleClear, disableClearable, warning, onChange, ...muiProps } = props;
    const { t } = useCCTranslations();
    // handle clear
    const [hasValue, setHasValue] = useState(!!(muiProps.value ?? muiProps.defaultValue));
    const composeRef = useRefComposer();
    const inputRef = useRef(null);
    const handleClear = useCallback((evt) => {
        if (!inputRef.current) {
            throw new Error("InputRef not set");
        }
        evt.stopPropagation();
        if (customHandleClear) {
            return customHandleClear();
        }
        const proto = (muiProps.multiline ? HTMLTextAreaElement : HTMLInputElement).prototype;
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
        if (!nativeInputValueSetter) {
            throw new Error("Native Input Value Setter is undefined");
        }
        nativeInputValueSetter.call(inputRef.current, "");
        const event = new Event("input", { bubbles: true });
        inputRef.current.dispatchEvent(event);
        inputRef.current.blur();
        inputRef.current.focus();
    }, [muiProps.multiline, customHandleClear]);
    // keep "hasValue" up to date
    const handleChange = useCallback((evt) => {
        if (onChange)
            onChange(evt);
        setHasValue(!!evt.target.value);
    }, [onChange]);
    useEffect(() => {
        setHasValue(!!muiProps.value);
    }, [muiProps.value]);
    // render
    const showClear = isTouchDevice() && hasValue && !muiProps.disabled && !disableClearable;
    return (_jsx(UiKitTextFieldWithWarnings, { ref: ref, ...muiProps, warning: warning, onChange: handleChange, slotProps: {
            input: (props) => {
                const orgSlotProps = {
                    ...accessSlotProps(props, muiProps.slotProps?.input),
                };
                const hasEndAdornment = !!(showClear ||
                    openInfo ||
                    orgSlotProps?.endAdornment);
                return {
                    ...orgSlotProps,
                    endAdornment: hasEndAdornment ? (_jsx(_Fragment, { children: _jsxs(InputAdornment, { position: "end", children: [showClear && (_jsx(IconButton, { onClick: handleClear, size: "small", "aria-label": t("standalone.uikit.clear"), children: _jsx(ClearIcon, {}) })), typeof orgSlotProps?.endAdornment === "string"
                                    ? orgSlotProps.endAdornment
                                    : orgSlotProps?.endAdornment?.props?.children, openInfo && (_jsx(IconButton, { onClick: openInfo, size: "small", "aria-label": t("standalone.uikit.info"), children: _jsx(InfoIcon, { color: "disabled" }) }))] }) })) : undefined,
                };
            },
            htmlInput: (props) => ({
                ...accessSlotProps(props, muiProps.slotProps?.htmlInput),
                ref: composeRef(inputRef, accessSlotProps(props, muiProps.slotProps?.htmlInput)
                    ?.ref),
            }),
            inputLabel: (props) => ({
                ...InputLabelConfig,
                ...accessSlotProps(props, muiProps.slotProps?.inputLabel),
            }),
        } }));
});
export default React.memo(TextFieldWithHelp);
