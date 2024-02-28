import React from "react";
import {
	FormControlLabel,
	FormControlLabelProps,
	Typography,
	TypographyProps,
	Theme,
} from "@mui/material";

import { makeStyles, CSSProperties } from "@mui/styles";

export interface ComponentWithLabelProps
	extends Omit<FormControlLabelProps, "label"> {
	/**
	 * The text of the label
	 */
	labelText: string;
	/**
	 * Label variant
	 */
	labelVariant?: TypographyProps["variant"];
	/**
	 * Label location
	 */
	labelDisplay?: TypographyProps["display"];
	/**
	 * Label alignment
	 */
	labelAlign?: TypographyProps["align"];
	/**
	 * Custom styles
	 */
	classes?: Partial<ReturnType<typeof useStyles>>;
}

export interface ComponentWithLabelTheme {
	whiteSpace?: CSSProperties["whiteSpace"];
	padding?: CSSProperties["padding"];
	margin?: CSSProperties["margin"];
	border?: CSSProperties["border"];
	borderRadius?: CSSProperties["borderRadius"];
	backgroundColor?: CSSProperties["backgroundColor"];
	color?: CSSProperties["color"];
	fontSize?: CSSProperties["fontSize"];
	fontWeight?: CSSProperties["fontWeight"];
	style?: CSSProperties;
}

const useStyles = makeStyles(
	(theme: Theme) => ({
		label: {
			whiteSpace: theme.componentsCare?.uiKit?.label?.whiteSpace || "pre",
			padding: theme.componentsCare?.uiKit?.label?.padding,
			margin: theme.componentsCare?.uiKit?.label?.margin,
			border: theme.componentsCare?.uiKit?.label?.border,
			borderRadius: theme.componentsCare?.uiKit?.label?.borderRadius,
			backgroundColor: theme.componentsCare?.uiKit?.label?.backgroundColor,
			color: theme.componentsCare?.uiKit?.label?.color,
			fontSize: theme.componentsCare?.uiKit?.label?.fontSize,
			fontWeight: theme.componentsCare?.uiKit?.label?.fontWeight,
			...theme.componentsCare?.uiKit?.label?.style,
		} as CSSProperties,
	}),
	{ name: "CcComponentWithLabel" },
);

const ComponentWithLabel = (
	props: ComponentWithLabelProps | FormControlLabelProps,
) => {
	const classes = useStyles(props);

	let label: FormControlLabelProps["label"];

	if ("labelText" in props) {
		let {
			// eslint-disable-next-line prefer-const
			labelText,
			labelVariant,
			labelDisplay,
			labelAlign,
			// eslint-disable-next-line prefer-const
			...propsCopy
		} = props;
		const labelPlacement = props.labelPlacement || "end";
		labelVariant = labelVariant ?? "caption";
		labelDisplay = labelDisplay ?? "block";
		labelAlign =
			labelAlign ??
			({
				start: "right",
				end: "left",
				top: "center",
				bottom: "center",
			}[labelPlacement] as TypographyProps["align"]);
		label = (
			<Typography
				variant={labelVariant}
				display={labelDisplay}
				align={labelAlign}
				className={classes.label}
			>
				{labelText}
			</Typography>
		);
		props = { ...propsCopy, label: "" };
	} else {
		label = props.label;
	}
	return <FormControlLabel {...props} label={label} />;
};

export default React.memo(ComponentWithLabel);
