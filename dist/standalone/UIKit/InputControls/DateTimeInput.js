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
import { IconButton, InputAdornment } from "@material-ui/core";
import { Info as InfoIcon, Event as CalenderIcon } from "@material-ui/icons";
import { InputLabelConfig, useInputStyles, } from "../CommonStyles";
import { LocalizedDateTimePicker } from "../../../standalone/LocalizedDateTimePickers";
var DateTimeInput = function (props) {
    var openInfo = props.openInfo, important = props.important, muiProps = __rest(props, ["openInfo", "important"]);
    var inputClasses = useInputStyles({ important: important });
    var handleOpenInfo = useCallback(function (event) {
        // Prevent calender popup open event, while clicking on info icon
        event.stopPropagation();
        if (openInfo)
            openInfo();
    }, [openInfo]);
    return (React.createElement(LocalizedDateTimePicker, __assign({}, muiProps, { clearable: true, InputProps: {
            classes: inputClasses,
            endAdornment: (React.createElement(InputAdornment, { position: "end" },
                !muiProps.disabled && (React.createElement(IconButton, null,
                    React.createElement(CalenderIcon, { color: "disabled" }))),
                openInfo && (React.createElement(IconButton, { onClick: handleOpenInfo },
                    React.createElement(InfoIcon, { color: "disabled" }))))),
        }, InputLabelProps: InputLabelConfig })));
};
export default React.memo(DateTimeInput);
