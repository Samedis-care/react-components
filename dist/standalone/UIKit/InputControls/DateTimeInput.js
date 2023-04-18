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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React, { useCallback } from "react";
import { IconButton, InputAdornment } from "@mui/material";
import { Info as InfoIcon, Event as CalenderIcon } from "@mui/icons-material";
import { InputLabelConfig, useInputStyles, } from "../CommonStyles";
import { LocalizedDateTimePicker } from "../../../standalone/LocalizedDateTimePickers";
var DateTimeInput = function (props) {
    var _a;
    var openInfo = props.openInfo, important = props.important, required = props.required, error = props.error, onBlur = props.onBlur, muiProps = __rest(props, ["openInfo", "important", "required", "error", "onBlur"]);
    var inputClasses = useInputStyles({ important: important });
    var handleOpenInfo = useCallback(function (event) {
        // Prevent calendar popup open event, while clicking on info icon
        event.stopPropagation();
        if (openInfo)
            openInfo();
    }, [openInfo]);
    return (React.createElement(LocalizedDateTimePicker, __assign({}, muiProps, { slotProps: __assign(__assign({}, muiProps.slotProps), { textField: __assign({ required: required, error: error, onBlur: onBlur, InputProps: {
                    classes: inputClasses,
                    endAdornment: (React.createElement(InputAdornment, { position: "end" },
                        !muiProps.disabled && (React.createElement(IconButton, { size: "large" },
                            React.createElement(CalenderIcon, { color: "disabled" }))),
                        openInfo && (React.createElement(IconButton, { onClick: handleOpenInfo, size: "large" },
                            React.createElement(InfoIcon, { color: "disabled" }))))),
                }, InputLabelProps: InputLabelConfig }, (_a = muiProps.slotProps) === null || _a === void 0 ? void 0 : _a.textField) }) })));
};
export default React.memo(DateTimeInput);
