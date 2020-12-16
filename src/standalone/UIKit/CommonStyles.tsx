import { makeStyles } from "@material-ui/core/styles";
import { InputLabelProps } from "@material-ui/core";

export interface UIInputProps {
	important?: boolean;
}

export const useInputStyles = makeStyles((theme) => ({
	root: {
		paddingLeft: theme.spacing(2),
		paddingRight: theme.spacing(2),
	},
	input: (props: UIInputProps) => ({
		"&::placeholder": {
			fontStyle: "italic",
			color: props.important ? "rgba(255, 0, 0, 0.75)" : undefined,
		},
	}),
}));

export const InputLabelConfig: InputLabelProps = {
	shrink: true,
	focused: false,
};
