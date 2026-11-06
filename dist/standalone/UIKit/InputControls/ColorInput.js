import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import TextFieldWithHelp from "../TextFieldWithHelp";
import { ChromePicker } from "react-color";
import { Popover } from "@mui/material";
const anchorOrigin = {
    vertical: "bottom",
    horizontal: "center",
};
const transformOrigin = {
    vertical: "top",
    horizontal: "center",
};
const ColorInput = (props) => {
    const { onChange } = props;
    // null and undefined behave like "": the input stays controlled, and the
    // picker gets a string (react-color throws on null)
    const value = props.value ?? "";
    const [pickerAnchor, setPickerAnchor] = useState(null);
    const openColorPicker = (evt) => {
        if (props.disabled)
            return;
        setPickerAnchor(evt.currentTarget);
    };
    const closeColorPicker = () => setPickerAnchor(null);
    // close picker when going read-only
    useEffect(() => {
        if (!props.disabled)
            return;
        setPickerAnchor(null);
    }, [props.disabled]);
    const handleTextFieldChange = (evt) => {
        onChange(evt.target.value);
    };
    const handleColorPickerChange = (color) => {
        onChange(color.hex);
    };
    return (_jsxs(_Fragment, { children: [_jsx(TextFieldWithHelp, { ...props, value: value, onChange: handleTextFieldChange, onClick: openColorPicker, multiline: false }), _jsx(Popover, { open: pickerAnchor != null, anchorEl: pickerAnchor, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, onClose: closeColorPicker, children: _jsx(ChromePicker, { color: value, onChange: handleColorPickerChange }) })] }));
};
export default React.memo(ColorInput);
