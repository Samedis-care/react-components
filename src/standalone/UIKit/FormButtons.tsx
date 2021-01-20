import React, { CSSProperties } from "react";
import { makeStyles, Theme } from "@material-ui/core";
import { fade } from "@material-ui/core/styles/colorManipulator";

export interface FormButtonTheme {
	buttonWrapper?: {
		float?: CSSProperties["float"];
		margin?: CSSProperties["margin"];
	};
	container?: {
		float?: CSSProperties["float"];
		width?: CSSProperties["width"];
		padding?: CSSProperties["padding"];
		margin?: CSSProperties["margin"];
		border?: CSSProperties["border"];
		borderRadius?: CSSProperties["borderRadius"];
		backgroundColor?: CSSProperties["backgroundColor"];
		backgroundColorOpacity?: CSSProperties["opacity"];
	};
}

const useStyles = makeStyles((theme: Theme) => ({
	container: {
		width: theme.componentsCare?.uiKit?.formButtons?.container?.width,
		float: theme.componentsCare?.uiKit?.formButtons?.container?.float || "left",
		margin: theme.componentsCare?.uiKit?.formButtons?.container?.margin,
		padding: theme.componentsCare?.uiKit?.formButtons?.container?.padding,
		border:
			theme.componentsCare?.uiKit?.formButtons?.container?.border || undefined,
		borderRadius:
			theme.componentsCare?.uiKit?.formButtons?.container?.borderRadius,
		backgroundColor: fade(
			theme.componentsCare?.uiKit?.formButtons?.container?.backgroundColor ||
				"#FFF",
			theme.componentsCare?.uiKit?.formButtons?.container
				?.backgroundColorOpacity || 1
		),
	},
	buttonWrapper: {
		float:
			theme.componentsCare?.uiKit?.formButtons?.buttonWrapper?.float || "left",
		margin: theme.componentsCare?.uiKit?.formButtons?.buttonWrapper?.margin,
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
}

const FormButtons = (props: FormButtonsProps) => {
	const classes = useStyles();
	const children =
		"length" in props.children ? props.children : [props.children];

	if (!children) throw new Error("Atleast one button required");

	return (
		<div className={classes.container}>
			{children.map((child: React.ReactNode, index: number) => {
				return (
					<span className={classes.buttonWrapper} key={index}>
						{child}
					</span>
				);
			})}
		</div>
	);
};

export default React.memo(FormButtons);
