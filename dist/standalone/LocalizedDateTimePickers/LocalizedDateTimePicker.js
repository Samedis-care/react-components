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
import { DateTimePicker } from "@mui/x-date-pickers";
import { withMuiWarning } from "../UIKit";
var LocalizedDateTimePicker = function (props) {
    var _a;
    var required = props.required, error = props.error, fullWidth = props.fullWidth, onBlur = props.onBlur, otherProps = __rest(props, ["required", "error", "fullWidth", "onBlur"]);
    return (React.createElement(DateTimePicker, __assign({ format: "L LT" }, otherProps, { slotProps: __assign(__assign({}, otherProps.slotProps), { textField: __assign({ required: required, error: error, fullWidth: fullWidth, onBlur: onBlur }, (_a = otherProps.slotProps) === null || _a === void 0 ? void 0 : _a.textField) }) })));
};
export default React.memo(withMuiWarning(LocalizedDateTimePicker));
