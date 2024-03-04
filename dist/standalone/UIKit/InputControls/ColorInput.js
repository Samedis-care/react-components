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
    const { value, onChange } = props;
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
    return (React.createElement(React.Fragment, null,
        React.createElement(TextFieldWithHelp, { ...props, value: value, onChange: handleTextFieldChange, onClick: openColorPicker, multiline: false }),
        React.createElement(Popover, { open: pickerAnchor != null, anchorEl: pickerAnchor, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, onClose: closeColorPicker },
            React.createElement(ChromePicker, { color: value, onChange: handleColorPickerChange }))));
};
export default React.memo(ColorInput);
