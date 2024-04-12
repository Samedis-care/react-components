import React from "react";
import { FormControl, FormHelperText, FormLabel, styled, TextField, } from "@mui/material";
export const withMuiWarning = (Component) => {
    // not unnecessary, component name is inferred from it
    // noinspection UnnecessaryLocalVariableJS
    return styled((props) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { warning, ...other } = props;
        return React.createElement(Component, { ...other });
    })(({ theme, warning }) => ({
        ...(warning && {
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
        }),
    }));
};
export const FormControlCC = withMuiWarning(FormControl);
export const FormControlFieldsetCC = withMuiWarning(FormControl);
export const FormLabelCC = withMuiWarning(FormLabel);
export const FormHelperTextCC = withMuiWarning(FormHelperText);
export const TextFieldCC = withMuiWarning(TextField);
