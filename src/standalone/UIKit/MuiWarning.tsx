import React from "react";
import {
	FormControl,
	FormControlProps,
	FormHelperText,
	FormHelperTextProps,
	FormLabel,
	FormLabelProps,
	TextField,
	TextFieldProps,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { combineClassNames } from "../../utils";

export const useMuiWarningStyles = makeStyles(
	(theme) => ({
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
	}),
	{ name: "CcMuiWarning" },
);

export interface MuiWarningSourceProps {
	className?: string;
}

export interface MuiWarningResultProps {
	warning?: boolean;
}

export const withMuiWarning = <T extends MuiWarningSourceProps>(
	Component: React.ComponentType<T>,
): React.ComponentType<T & MuiWarningResultProps> => {
	// not unnecessary, component name is inferred from it
	// noinspection UnnecessaryLocalVariableJS
	const MuiWarning = (props: T & MuiWarningResultProps) => {
		const { warning, ...muiProps } = props;
		const classes = useMuiWarningStyles();
		return (
			<Component
				{...(muiProps as unknown as T)}
				className={combineClassNames([
					warning && classes.warning,
					props.className,
				])}
			/>
		);
	};
	return MuiWarning;
};

export const FormControlCC = withMuiWarning<FormControlProps>(FormControl);
export const FormControlFieldsetCC =
	withMuiWarning<FormControlProps<"fieldset", { component: "fieldset" }>>(
		FormControl,
	);
export const FormLabelCC = withMuiWarning<FormLabelProps>(FormLabel);
export const FormHelperTextCC =
	withMuiWarning<FormHelperTextProps>(FormHelperText);
export const TextFieldCC = withMuiWarning<TextFieldProps>(TextField);
