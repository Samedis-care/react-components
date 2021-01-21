import { CSSProperties } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { InputLabelProps } from "@material-ui/core";

export interface UIInputProps {
	important?: boolean;
}

export interface InputTheme {
	fontSize?: CSSProperties["fontSize"];
	fontStyle?: CSSProperties["fontStyle"];
	fontWeight?: CSSProperties["fontWeight"];
	padding?: CSSProperties["padding"];
	paddingTop?: CSSProperties["paddingTop"];
	paddingRight?: CSSProperties["paddingRight"];
	paddingBottom?: CSSProperties["paddingBottom"];
	paddingLeft?: CSSProperties["paddingLeft"];

	border?: CSSProperties["border"];
	borderRadius?: CSSProperties["borderRadius"];

	backgroundColor?: CSSProperties["backgroundColor"];
	color?: CSSProperties["color"];

	style?: CSSProperties;

	disabled?: {
		backgroundColor?: CSSProperties["backgroundColor"];
		style?: CSSProperties;
	};

	placeholder?: {
		fontSize?: CSSProperties["fontSize"];
		fontStyle?: CSSProperties["fontStyle"];
		fontWeight?: CSSProperties["fontWeight"];

		backgroundColor?: CSSProperties["backgroundColor"];
		color?: CSSProperties["color"];

		style?: CSSProperties;

		/* this is for required fields */
		important?: {
			fontSize?: CSSProperties["fontSize"];
			fontStyle?: CSSProperties["fontStyle"];
			fontWeight?: CSSProperties["fontWeight"];

			backgroundColor?: CSSProperties["backgroundColor"];
			color?: CSSProperties["color"];

			style?: CSSProperties;
		};
	};
}

export const useInputStyles = makeStyles((theme) => ({
	root: {
		fontSize: theme.componentsCare?.uiKit?.input?.fontSize,
		fontStyle: theme.componentsCare?.uiKit?.input?.fontStyle,
		fontWeight: theme.componentsCare?.uiKit?.input?.fontWeight,

		padding: theme.componentsCare?.uiKit?.input?.padding,
		paddingTop: theme.componentsCare?.uiKit?.input?.paddingTop || 0,
		paddingRight:
			theme.componentsCare?.uiKit?.input?.paddingTop || theme.spacing(2),
		paddingBottom: theme.componentsCare?.uiKit?.input?.paddingTop || 0,
		paddingLeft:
			theme.componentsCare?.uiKit?.input?.paddingTop || theme.spacing(2),

		border: theme.componentsCare?.uiKit?.input?.border,
		borderRadius: theme.componentsCare?.uiKit?.input?.borderRadius,

		backgroundColor: theme.componentsCare?.uiKit?.input?.backgroundColor,
		color: theme.componentsCare?.uiKit?.input?.color,
		...{ ...theme.componentsCare?.uiKit?.input?.style },
	},
	input: (props: UIInputProps) => ({
		"&::placeholder": {
			fontSize: props.important
				? theme.componentsCare?.uiKit?.input?.placeholder?.important
						?.fontSize ||
				  theme.componentsCare?.uiKit?.input?.placeholder?.fontSize
				: theme.componentsCare?.uiKit?.input?.placeholder?.fontSize,
			fontStyle: props.important
				? theme.componentsCare?.uiKit?.input?.placeholder?.important?.fontStyle
				: theme.componentsCare?.uiKit?.input?.placeholder?.fontStyle,
			fontWeight: props.important
				? theme.componentsCare?.uiKit?.input?.placeholder?.important?.fontWeight
				: theme.componentsCare?.uiKit?.input?.placeholder?.fontWeight,

			backgroundColor: props.important
				? theme.componentsCare?.uiKit?.input?.placeholder?.important
						?.backgroundColor
				: theme.componentsCare?.uiKit?.input?.placeholder?.backgroundColor,
			color: props.important
				? theme.componentsCare?.uiKit?.input?.placeholder?.important?.color ||
				  theme.palette.error.main
				: theme.componentsCare?.uiKit?.input?.placeholder?.color,
			...{
				...theme.componentsCare?.uiKit?.input?.placeholder?.style,
				...(props.important
					? theme.componentsCare?.uiKit?.input?.placeholder?.important?.style
					: {}),
			},
		},
	}),
}));

export const InputLabelConfig: InputLabelProps = {
	shrink: true,
	focused: false,
};
