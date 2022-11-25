import { makeStyles, Theme } from "@material-ui/core/styles";
import { InputClassKey, InputLabelProps } from "@material-ui/core";
import { Styles } from "@material-ui/core/styles/withStyles";
import { makeThemeStyles, useMultipleStyles } from "../../utils";
import { ClassNameMap } from "@material-ui/styles/withStyles";

export interface UIInputProps {
	important?: boolean;
	warning?: boolean;
}

interface UIInputPropsWithStyles extends UIInputProps {
	/**
	 * Custom CSS styles
	 */
	classes?: ClassNameMap<InputClassKey>;
}

export type InputTheme = Partial<Styles<Theme, UIInputProps, InputClassKey>>;

const useThemeStyles = makeThemeStyles<UIInputProps, InputClassKey>(
	(theme) => theme.componentsCare?.uiKit?.input,
	"CcUIKitInput"
);

const useRawInputStyles = makeStyles(
	(theme) => ({
		root: {
			paddingTop: 0,
			paddingRight: theme.spacing(2),
			paddingBottom: 0,
			paddingLeft: theme.spacing(2),
			"& .MuiAutocomplete-endAdornment": {
				right: theme.spacing(2),
			},
		},
		input: (props: UIInputPropsWithStyles) => ({
			"&::placeholder": {
				color: props.important ? theme.palette.error.main : undefined,
			},
		}),
		multiline: {
			padding: theme.spacing(2),
		},
	}),
	{ name: "CcUIKitInput" }
);

export const useInputStyles = (
	props: UIInputProps
): Partial<ClassNameMap<InputClassKey>> => {
	return useMultipleStyles(props, useThemeStyles, useRawInputStyles);
};

export const InputLabelConfig: InputLabelProps = {
	shrink: true,
};
