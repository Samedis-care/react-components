import React from "react";
import { FormControl, FormHelperText, FormLabel, TextField, } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { combineClassNames } from "../../utils";
export const useMuiWarningStyles = makeStyles((theme) => ({
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
}), { name: "CcMuiWarning" });
export const withMuiWarning = (Component) => {
    // not unnecessary, component name is inferred from it
    // noinspection UnnecessaryLocalVariableJS
    const MuiWarning = (props) => {
        const { warning, ...muiProps } = props;
        const classes = useMuiWarningStyles();
        return (React.createElement(Component, { ...muiProps, className: combineClassNames([
                warning && classes.warning,
                props.className,
            ]) }));
    };
    return MuiWarning;
};
export const FormControlCC = withMuiWarning(FormControl);
export const FormControlFieldsetCC = withMuiWarning(FormControl);
export const FormLabelCC = withMuiWarning(FormLabel);
export const FormHelperTextCC = withMuiWarning(FormHelperText);
export const TextFieldCC = withMuiWarning(TextField);
