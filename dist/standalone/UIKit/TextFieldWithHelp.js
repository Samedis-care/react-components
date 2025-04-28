import React, { useCallback, useEffect, useRef, useState, } from "react";
import { IconButton, InputAdornment, } from "@mui/material";
import { Clear as ClearIcon, Info as InfoIcon } from "@mui/icons-material";
import { InputLabelConfig, UiKitTextField } from "./CommonStyles";
import isTouchDevice from "../../utils/isTouchDevice";
import { withMuiWarning } from "./MuiWarning";
import { useRefComposer } from "react-ref-composer";
import accessSlotProps from "../../utils/internal/accessSlotProps";
export const UiKitTextFieldWithWarnings = withMuiWarning(UiKitTextField);
const TextFieldWithHelp = React.forwardRef(function TextFieldWithHelpInner(props, ref) {
    const { openInfo, customHandleClear, warning, onChange, ...muiProps } = props;
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
    const showClear = isTouchDevice() && hasValue && !muiProps.disabled;
    return (React.createElement(UiKitTextFieldWithWarnings, { ref: ref, ...muiProps, warning: warning, onChange: handleChange, slotProps: {
            input: (props) => {
                const orgSlotProps = {
                    ...accessSlotProps(props, muiProps.slotProps?.input),
                    ...muiProps.InputProps,
                };
                const hasEndAdornment = !!(showClear ||
                    openInfo ||
                    orgSlotProps?.endAdornment);
                return {
                    ...orgSlotProps,
                    endAdornment: hasEndAdornment ? (React.createElement(React.Fragment, null,
                        React.createElement(InputAdornment, { position: "end" },
                            showClear && (React.createElement(IconButton, { onClick: handleClear, size: "small" },
                                React.createElement(ClearIcon, null))),
                            typeof orgSlotProps?.endAdornment === "string"
                                ? orgSlotProps.endAdornment
                                : orgSlotProps?.endAdornment?.props?.children,
                            openInfo && (React.createElement(IconButton, { onClick: openInfo, size: "small" },
                                React.createElement(InfoIcon, { color: "disabled" })))))) : undefined,
                };
            },
            htmlInput: (props) => ({
                ...accessSlotProps(props, muiProps.slotProps?.htmlInput),
                ref: composeRef(inputRef, accessSlotProps(props, muiProps.slotProps?.htmlInput)
                    ?.ref),
            }),
            inputLabel: (props) => ({
                ...InputLabelConfig,
                ...muiProps.InputLabelProps,
                ...accessSlotProps(props, muiProps.slotProps?.inputLabel),
            }),
        } }));
});
export default React.memo(TextFieldWithHelp);
