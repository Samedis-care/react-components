import { makeStyles, Theme } from "@material-ui/core/styles";
import { InputClassKey, InputLabelProps } from "@material-ui/core";
import { Styles } from "@material-ui/core/styles/withStyles";
import { makeThemeStyles } from "../../utils";
import { ClassNameMap } from "@material-ui/styles/withStyles";

export interface UIInputProps {
	important?: boolean;
}

interface UIInputPropsWithStyles extends UIInputProps {
	/**
	 * Custom CSS styles
	 */
	classes?: ClassNameMap<InputClassKey>;
}

export type InputTheme = Partial<Styles<Theme, UIInputProps, InputClassKey>>;

const useThemeStyles = makeThemeStyles<UIInputProps, InputClassKey>(
	(theme) => theme.componentsCare?.uiKit?.input
);

const useRawInputStyles = makeStyles((theme) => ({
	root: {
		paddingTop: 0,
		paddingRight: theme.spacing(2),
		paddingBottom: 0,
		paddingLeft: theme.spacing(2),
	},
	input: (props: UIInputPropsWithStyles) => ({
		"&::placeholder": {
			color: props.important ? theme.palette.error.main : undefined,
		},
	}),
	multiline: {
		padding: theme.spacing(2),
	},
}));

export const useInputStyles = (
	props: UIInputProps
): Partial<ClassNameMap<InputClassKey>> => {
	const themeClasses = useThemeStyles(props);
	return useRawInputStyles({ ...props, classes: themeClasses });
};

export const InputLabelConfig: InputLabelProps = {
	shrink: true,
};
