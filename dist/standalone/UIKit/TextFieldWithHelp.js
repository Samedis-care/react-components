import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useCallback, useId, useRef, useState, } from "react";
import { IconButton, InputAdornment, } from "@mui/material";
import { Clear as ClearIcon, Info as InfoIcon } from "@mui/icons-material";
import { InputLabelConfig, UiKitTextField } from "./CommonStyles";
import isTouchDevice from "../../utils/isTouchDevice";
import { withMuiFieldState } from "./MuiFieldState";
import useCCTranslations from "../../utils/useCCTranslations";
import { useRefComposer } from "react-ref-composer";
import accessSlotProps from "../../utils/internal/accessSlotProps";
export const UiKitTextFieldWithState = withMuiFieldState(UiKitTextField);
/**
 * MUI's `TextField` with an optional info button, a Clear button on touch devices and the
 * field states of {@link withMuiFieldState} (`warning`, `dirty`).
 *
 * Every entry of `slotProps` (`root`, `input`, `inputLabel`, `htmlInput`,
 * `formHelperText`, `select`), as an object or a function, reaches MUI's `TextField`. Three
 * of them are extended: `input` gets the field's end adornment, `htmlInput` the helper
 * text's id (see below) and the ref the Clear button uses, `inputLabel` `shrink: true`,
 * which the caller's own `shrink` overrides. `onChange` gets every argument MUI calls it
 * with: in a non-native `select` the chosen option's element follows the event, as from
 * MUI's `Select`.
 *
 * An `aria-describedby` in `slotProps.htmlInput` describes the input after the helper text,
 * where MUI's `TextField` would let it replace the helper text's id.
 */
const TextFieldWithHelp = React.forwardRef(function TextFieldWithHelpInner(props, ref) {
    const { openInfo, customHandleClear, disableClearable, warning, dirty, onChange, ...muiProps } = props;
    const { t } = useCCTranslations();
    // MUI's TextField ties the helper text to the input with aria-describedby, which an
    // aria-describedby in slotProps.htmlInput replaces: the field gets MUI's id (the given
    // one, else React's) so the helper text's id is known and can be kept
    const generatedId = useId();
    const id = muiProps.id ?? generatedId;
    const helperTextId = muiProps.helperText && id ? `${id}-helper-text` : undefined;
    // handle clear
    // what an uncontrolled field shows: its defaultValue, then what was typed
    const [uncontrolledValue, setUncontrolledValue] = useState(muiProps.defaultValue);
    const composeRef = useRefComposer();
    const inputRef = useRef(null);
    const handleClear = useCallback((evt) => {
        evt.stopPropagation();
        if (customHandleClear) {
            customHandleClear();
            // the Clear button unmounts with the value: keep focus in the field,
            // as the default clear below does
            inputRef.current?.focus();
            return;
        }
        if (!inputRef.current) {
            throw new Error("InputRef not set");
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
    // keep "uncontrolledValue" up to date
    const handleChange = useCallback((...args) => {
        const forward = onChange;
        if (forward)
            forward(...args);
        setUncontrolledValue(args[0].target.value);
    }, [onChange]);
    // render
    const canClear = isTouchDevice() &&
        !muiProps.disabled &&
        !disableClearable &&
        // the default clear empties the <input> or <textarea>; a select has
        // neither (its htmlInput ref holds MUI's handle), so it needs a handler
        (!muiProps.select || !!customHandleClear);
    return (_jsx(UiKitTextFieldWithState, { ref: ref, ...muiProps, id: id, warning: warning, dirty: dirty, onChange: handleChange, slotProps: {
            ...muiProps.slotProps,
            input: (props) => {
                const orgSlotProps = {
                    ...accessSlotProps(props, muiProps.slotProps?.input),
                };
                // what the field shows: the controlled value, which MUI takes
                // from slotProps.htmlInput before value, or the uncontrolled one
                const htmlInputProps = accessSlotProps(props, muiProps.slotProps?.htmlInput);
                const value = htmlInputProps?.value ?? muiProps.value ?? uncontrolledValue;
                // the input slots can lock the input while the field is not disabled
                const inputLocked = !!(orgSlotProps.readOnly ||
                    orgSlotProps.disabled ||
                    htmlInputProps?.readOnly ||
                    htmlInputProps?.disabled);
                const showClear = canClear &&
                    !inputLocked &&
                    value != null &&
                    value !== "" &&
                    !(Array.isArray(value) && value.length === 0);
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
            htmlInput: (props) => {
                const htmlInputProps = accessSlotProps(props, muiProps.slotProps?.htmlInput);
                const ids = htmlInputProps?.["aria-describedby"]
                    ?.split(/\s+/)
                    .filter(Boolean) ?? [];
                return {
                    ...htmlInputProps,
                    // the helper text first, as it is shown, then the given ids
                    ...(helperTextId && {
                        "aria-describedby": (ids.includes(helperTextId)
                            ? ids
                            : [helperTextId, ...ids]).join(" "),
                    }),
                    ref: composeRef(inputRef, htmlInputProps?.ref),
                };
            },
            inputLabel: (props) => ({
                ...InputLabelConfig,
                ...accessSlotProps(props, muiProps.slotProps?.inputLabel),
            }),
        } }));
});
export default React.memo(TextFieldWithHelp);
