import {
	Input,
	InputLabelProps,
	InputProps,
	OutlinedInput,
	OutlinedInputProps,
	styled,
	TextField,
	TextFieldProps,
	Theme,
} from "@mui/material";
import React from "react";
import { PickersTextField, PickersTextFieldProps } from "@mui/x-date-pickers";

export interface UIInputProps {
	important?: boolean;
	warning?: boolean;
}

export type UiKitInputClassKey = "root";
export type UiKitInputProps = UIInputProps & InputProps;
export type UiKitInputOutlinedClassKey = "root";
export type UiKitInputOutlinedProps = UIInputProps & OutlinedInputProps;
export type UiKitTextFieldClassKey = "root";
export type UiKitTextFieldProps = UIInputProps & TextFieldProps;
export type UiKitPickersTextFieldProps = UIInputProps & PickersTextFieldProps;

const inputStyles = ({
	theme,
	important,
}: {
	theme: Theme;
	important?: boolean;
}) => ({
	paddingTop: 0,
	paddingRight: theme.spacing(2),
	paddingBottom: 0,
	paddingLeft: theme.spacing(2),
	"& .MuiAutocomplete-endAdornment": {
		right: theme.spacing(2),
	},
	"& .MuiInput-input::placeholder": {
		color: important ? theme.palette.error.main : undefined,
	},
	"& .MuiInput-multiline": {
		padding: theme.spacing(2),
	},
});

export const UiKitInput: React.ComponentType<UiKitInputProps> = styled(Input, {
	name: "CcUiKitInput",
	slot: "root",
})<UiKitInputProps>(inputStyles);
export const UiKitInputOutlined: React.ComponentType<UiKitInputOutlinedProps> =
	styled(OutlinedInput, {
		name: "CcUiKitInputOutlined",
		slot: "root",
	})<UiKitInputOutlinedProps>(inputStyles);
export const UiKitTextField: React.ComponentType<UiKitTextFieldProps> = styled(
	TextField,
	{
		name: "CcUiKitTextField",
		slot: "root",
	},
)<UiKitTextFieldProps>(({ theme, important }) => ({
	"& .MuiInput-root": inputStyles({ theme, important }),
}));

export const UiKitPickersTextField: React.ComponentType<UiKitPickersTextFieldProps> =
	styled(PickersTextField, {
		name: "CcUiKitPickersTextField",
		slot: "root",
	})<UiKitPickersTextFieldProps>(({ theme, important }) => ({
		"& .MuiInput-root": inputStyles({ theme, important }),
	}));

export const InputLabelConfig: InputLabelProps = {
	shrink: true,
};
