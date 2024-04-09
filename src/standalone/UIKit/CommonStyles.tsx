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

export const UiKitInput = styled(Input, {
	name: "CcUiKitInput",
	slot: "root",
})<UiKitInputProps>(inputStyles);
export const UiKitInputOutlined = styled(OutlinedInput, {
	name: "CcUiKitInputOutlined",
	slot: "root",
})<UiKitInputOutlinedProps>(inputStyles);
export const UiKitTextField = styled(TextField, {
	name: "CcUiKitTextField",
	slot: "root",
})<UiKitTextFieldProps>(({ theme, important }) => ({
	"& .MuiInput-root": inputStyles({ theme, important }),
}));

export const InputLabelConfig: InputLabelProps = {
	shrink: true,
};
