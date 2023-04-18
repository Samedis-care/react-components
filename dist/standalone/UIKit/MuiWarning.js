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
import { FormControl, FormHelperText, FormLabel, TextField, } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { combineClassNames } from "../../utils";
export var useMuiWarningStyles = makeStyles(function (theme) { return ({
    warning: {
        "& > .MuiFormLabel-root": {
            color: theme.palette.warning.main,
        },
        "&.MuiFormLabel-root": {
            color: theme.palette.warning.main,
        },
        "& > .MuiFormLabel-root.Mui-error": {
            color: theme.palette.error.main,
        },
        "&.MuiFormLabel-root.Mui-error": {
            color: theme.palette.error.main,
        },
        "& > .MuiInput-underline::after": {
            transform: "scaleX(1)",
            borderBottomColor: theme.palette.warning.main,
        },
        "& > .MuiInput-underline.Mui-error::after": {
            transform: "scaleX(1)",
            borderBottomColor: theme.palette.error.main,
        },
        "& > .MuiFormHelperText-root": {
            color: theme.palette.warning.main,
        },
        "&.MuiFormHelperText-root": {
            color: theme.palette.warning.main,
        },
        "& > .MuiFormHelperText-root.Mui-error": {
            color: theme.palette.error.main,
        },
        "&.MuiFormHelperText-root.Mui-error": {
            color: theme.palette.error.main,
        },
        "& > .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.warning.main,
        },
        "& > .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.error.main,
        },
        "& > .MuiFilledInput-underline::after": {
            transform: "scaleX(1)",
            borderBottomColor: theme.palette.warning.main,
        },
        "& > .MuiFilledInput-underline.Mui-error::after": {
            transform: "scaleX(1)",
            borderBottomColor: theme.palette.error.main,
        },
    },
}); }, { name: "CcMuiWarning" });
export var withMuiWarning = function (Component) {
    // not unnecessary, component name is inferred from it
    // noinspection UnnecessaryLocalVariableJS
    var MuiWarning = function (props) {
        var warning = props.warning, muiProps = __rest(props, ["warning"]);
        var classes = useMuiWarningStyles();
        return (React.createElement(Component, __assign({}, muiProps, { className: combineClassNames([
                warning && classes.warning,
                props.className,
            ]) })));
    };
    return MuiWarning;
};
export var FormControlCC = withMuiWarning(FormControl);
export var FormControlFieldsetCC = withMuiWarning(FormControl);
export var FormLabelCC = withMuiWarning(FormLabel);
export var FormHelperTextCC = withMuiWarning(FormHelperText);
export var TextFieldCC = withMuiWarning(TextField);
