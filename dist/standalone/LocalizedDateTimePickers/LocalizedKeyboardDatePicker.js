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
import React from "react";
import { DatePicker } from "@mui/x-date-pickers";
import { useTheme } from "@mui/material";
import { withMuiWarning } from "../UIKit";
var LocalizedKeyboardDatePicker = function (props) {
    var _a, _b, _c;
    var hideDisabledIcon = props.hideDisabledIcon, required = props.required, error = props.error, fullWidth = props.fullWidth, onBlur = props.onBlur, otherProps = __rest(props, ["hideDisabledIcon", "required", "error", "fullWidth", "onBlur"]);
    var theme = useTheme();
    var hideDisabledIcons = hideDisabledIcon !== null && hideDisabledIcon !== void 0 ? hideDisabledIcon : (_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.uiKit) === null || _b === void 0 ? void 0 : _b.hideDisabledIcons;
    var slotOverrideHideIcon = __assign(__assign({}, otherProps.slots), { OpenPickerIcon: React.Fragment });
    return (React.createElement(DatePicker, __assign({ format: "L" }, otherProps, { slots: otherProps.disabled && hideDisabledIcons
            ? slotOverrideHideIcon
            : otherProps.slots, slotProps: __assign(__assign({}, otherProps.slotProps), { textField: __assign({ required: required, error: error, fullWidth: fullWidth, onBlur: onBlur }, (_c = otherProps.slotProps) === null || _c === void 0 ? void 0 : _c.textField) }) })));
};
export default React.memo(withMuiWarning(LocalizedKeyboardDatePicker));
