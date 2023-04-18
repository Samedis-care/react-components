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
import React from "react";
import { DatePicker } from "@mui/x-date-pickers";
import { withMuiWarning } from "../UIKit";
var LocalizedDatePicker = function (props) {
    return React.createElement(DatePicker, __assign({ format: "L" }, props));
};
export default React.memo(withMuiWarning(LocalizedDatePicker));
