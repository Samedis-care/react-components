import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { InputLabelProps } from "@material-ui/core";

export const useInputStyles = makeStyles((theme) => ({
	root: {
		paddingLeft: theme.spacing(2),
		paddingRight: theme.spacing(2),
	},
	input: {
		"&::-webkit-input-placeholder": {
			fontStyle: "italic",
		},
		"&:-moz-placeholder": {
			fontStyle: "italic",
		},
		"&::-moz-placeholder": {
			fontStyle: "italic",
		},
		"&:-ms-input-placeholder": {
			fontStyle: "italic",
		},
	},
}));

export const InputLabelConfig: InputLabelProps = {
	shrink: true,
	focused: false,
};
