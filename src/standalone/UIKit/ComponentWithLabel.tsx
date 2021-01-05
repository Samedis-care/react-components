import React from "react";
import {
	FormControlLabel,
	FormControlLabelProps,
	Typography,
	TypographyProps,
	makeStyles,
} from "@material-ui/core";

export interface ComponentWithLabelProps
	extends Omit<FormControlLabelProps, "label"> {
	labelText: string;
	labelVariant?: TypographyProps["variant"];
	labelDisplay?: TypographyProps["display"];
	labelAlign?: TypographyProps["align"];
}

const useStyles = makeStyles({
	label: {
		whiteSpace: "pre",
	},
});

const ComponentWithLabel = (
	props: ComponentWithLabelProps | FormControlLabelProps
) => {
	const classes = useStyles();

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
