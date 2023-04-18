import React from "react";
import { Theme, Unstable_Grid2 as Grid } from "@mui/material";
import { makeStyles, CSSProperties } from "@mui/styles";
import { alpha } from "@mui/material/styles";

export interface FormButtonTheme {
	buttonWrapper?: {
		float?: CSSProperties["float"];
		margin?: CSSProperties["margin"];
		style?: CSSProperties;
		firstChild?: {
			style?: CSSProperties;
		};
		lastChild?: {
			style?: CSSProperties;
		};
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

const useStyles = makeStyles(
	(theme: Theme) => ({
		container: {
			width: theme.componentsCare?.uiKit?.formButtons?.container?.width,
			margin: theme.componentsCare?.uiKit?.formButtons?.container?.margin,
			padding:
				theme.componentsCare?.uiKit?.formButtons?.container?.padding ||
				theme.spacing(3),
			border:
				theme.componentsCare?.uiKit?.formButtons?.container?.border ||
				undefined,
			borderRadius:
				theme.componentsCare?.uiKit?.formButtons?.container?.borderRadius,
			backgroundColor: alpha(
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
				...theme.componentsCare?.uiKit?.formButtons?.buttonWrapper?.firstChild
					?.style,
			},
			"&:last-child": {
				marginRight: 0,
				...theme.componentsCare?.uiKit?.formButtons?.buttonWrapper?.lastChild
					?.style,
			},
			...theme.componentsCare?.uiKit?.formButtons?.buttonWrapper?.style,
		},
	}),
	{ name: "CcFormButtons" }
);

export interface FormButtonsProps {
	/**
	 * Action buttons (used on form)
	 */
	children: React.ReactNode | React.ReactNode[];
	/**
	 * Custom styles
	 */
	classes?: Partial<ReturnType<typeof useStyles>>;
}

const FormButtons = (props: FormButtonsProps) => {
	const classes = useStyles(props);
	const children = (Array.isArray(props.children)
		? props.children
		: [props.children]
	).filter((child) => child !== undefined && child !== null && child !== false);

	if (children.length === 0) return <></>;

	return (
		<Grid
			container
			direction="row"
			spacing={2}
			className={classes.container}
			wrap={"nowrap"}
		>
			{children.map((child: React.ReactNode, index: number) => {
				return (
					<Grid className={classes.buttonWrapper} key={index}>
						{child}
					</Grid>
				);
			})}
		</Grid>
	);
};

export default React.memo(FormButtons);
