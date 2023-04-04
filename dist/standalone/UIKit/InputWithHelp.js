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
import { IconButton, InputAdornment, Input } from "@material-ui/core";
import { Info as InfoIcon } from "@material-ui/icons";
import { useInputStyles } from "./CommonStyles";
var InputWithHelpInner = function (props, ref) {
    var openInfo = props.openInfo, important = props.important, muiProps = __rest(props, ["openInfo", "important"]);
    var inputClasses = useInputStyles({ important: important });
    return (React.createElement(Input, __assign({ ref: ref, classes: inputClasses, endAdornment: openInfo && (React.createElement(InputAdornment, { position: "end" },
            React.createElement(IconButton, { onClick: openInfo },
                React.createElement(InfoIcon, { color: "disabled" })))) }, muiProps)));
};
var InputWithHelp = React.forwardRef(InputWithHelpInner);
export default React.memo(InputWithHelp);
