var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React, { useEffect, useState } from "react";
import { TextFieldWithHelp } from "../index";
import { ChromePicker } from "react-color";
import { Popover } from "@mui/material";
var anchorOrigin = {
    vertical: "bottom",
    horizontal: "center",
};
var transformOrigin = {
    vertical: "top",
    horizontal: "center",
};
var ColorInput = function (props) {
    var value = props.value, onChange = props.onChange;
    var _a = useState(null), pickerAnchor = _a[0], setPickerAnchor = _a[1];
    var openColorPicker = function (evt) {
        if (props.disabled)
            return;
        setPickerAnchor(evt.currentTarget);
    };
    var closeColorPicker = function () { return setPickerAnchor(null); };
    // close picker when going read-only
    useEffect(function () {
        if (!props.disabled)
            return;
        setPickerAnchor(null);
    }, [props.disabled]);
    var handleTextFieldChange = function (evt) {
        onChange(evt.target.value);
    };
    var handleColorPickerChange = function (color) {
        onChange(color.hex);
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(TextFieldWithHelp, __assign({}, props, { value: value, onChange: handleTextFieldChange, onClick: openColorPicker, multiline: false })),
        React.createElement(Popover, { open: pickerAnchor != null, anchorEl: pickerAnchor, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, onClose: closeColorPicker },
            React.createElement(ChromePicker, { color: value, onChange: handleColorPickerChange }))));
};
export default React.memo(ColorInput);
