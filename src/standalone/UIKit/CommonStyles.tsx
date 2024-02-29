import { Theme } from "@mui/material/styles";
import { Styles } from "@mui/styles";
import makeStyles from "@mui/styles/makeStyles";
import { InputClassKey, InputLabelProps } from "@mui/material";
import makeThemeStyles from "../../utils/makeThemeStyles";
import useMultipleStyles from "../../utils/useMultipleStyles";
import { ClassNameMap } from "@mui/styles/withStyles";

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
	"CcUIKitInput",
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
	{ name: "CcUIKitInput" },
);

export const useInputStyles = (
	props: UIInputProps,
): Partial<ClassNameMap<InputClassKey>> => {
	return useMultipleStyles(props, useThemeStyles, useRawInputStyles);
};

export const InputLabelConfig: InputLabelProps = {
	shrink: true,
};
