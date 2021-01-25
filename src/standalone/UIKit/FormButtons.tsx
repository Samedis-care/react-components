import React, { CSSProperties } from "react";
import { makeStyles, Theme, Grid } from "@material-ui/core";
import { fade } from "@material-ui/core/styles/colorManipulator";

export interface FormButtonTheme {
	buttonWrapper?: {
		float?: CSSProperties["float"];
		margin?: CSSProperties["margin"];
		style?: CSSProperties;
	};
	container?: {
		float?: CSSProperties["float"];
		width?: CSSProperties["width"];
		padding?: CSSProperties["padding"];
		margin?: CSSProperties["margin"];
		border?: CSSProperties["border"];
		borderRadius?: CSSProperties["borderRadius"];
		backgroundColor?: CSSProperties["backgroundColor"];
		backgroundColorOpacity?: number;
		style?: CSSProperties;
	};
}

const useStyles = makeStyles((theme: Theme) => ({
	container: {
		width: theme.componentsCare?.uiKit?.formButtons?.container?.width,
		margin: theme.componentsCare?.uiKit?.formButtons?.container?.margin,
		padding:
			theme.componentsCare?.uiKit?.formButtons?.container?.padding ||
			theme.spacing(3),
		border:
			theme.componentsCare?.uiKit?.formButtons?.container?.border || undefined,
		borderRadius:
			theme.componentsCare?.uiKit?.formButtons?.container?.borderRadius,
		backgroundColor: fade(
			theme.componentsCare?.uiKit?.formButtons?.container?.backgroundColor ||
				theme.palette.background.paper,
			theme.componentsCare?.uiKit?.formButtons?.container
				?.backgroundColorOpacity || 1
		),
		...theme.componentsCare?.uiKit?.formButtons?.container?.style,
	},
	buttonWrapper: {
		margin:
			theme.componentsCare?.uiKit?.formButtons?.buttonWrapper?.margin ||
			theme.spacing(0, 1, 0, 0),
		"&:first-child": {
			marginLeft: 0,
		},
		"&:last-child": {
			marginRight: 0,
		},
	},
}));

export interface FormButtonsProps {
	/**
	 * Action buttons (used on form)
	 */
	children: NonNullable<React.ReactNode[]>;
	/**
	 * Custom styles
	 */
	classes?: Partial<ReturnType<typeof useStyles>>;
}

const FormButtons = (props: FormButtonsProps) => {
	const classes = useStyles(props);
	const children =
		"length" in props.children ? props.children : [props.children];

	if (!children) throw new Error("Atleast one button required");

	return (
		<Grid container direction="row" spacing={2} className={classes.container}>
			{children.map((child: React.ReactNode, index: number) => {
				return (
					<Grid item className={classes.buttonWrapper} key={index}>
						{child}
					</Grid>
				);
			})}
		</Grid>
	);
};

export default React.memo(FormButtons);
