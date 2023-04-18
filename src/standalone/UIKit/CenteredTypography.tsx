import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Typography, TypographyProps } from "@mui/material";

export interface CenteredTypographyProps
	extends Omit<TypographyProps, "classes"> {
	/**
	 * Custom styles
	 */
	classes?: Partial<ReturnType<typeof useStyles>>;
	/**
	 * Sub classes to apply
	 */
	subClasses?: {
		typography?: TypographyProps["classes"];
	};
}

const useStyles = makeStyles(
	{
		innerWrapper: {
			height: 70,
			left: "50%",
			position: "absolute",
			textAlign: "center",
			top: "50%",
			transform: "translate(-50%, -50%)",
			width: "100%",
		},
		outerWrapper: {
			height: "100%",
			position: "relative",
			width: "100%",
		},
	},
	{ name: "CcCenteredTypography" }
);

const CenteredTypography = (props: CenteredTypographyProps) => {
	const classes = useStyles(props);

	return (
		<div className={classes.outerWrapper}>
			<div className={classes.innerWrapper}>
				<Typography {...props} classes={props.subClasses?.typography} />
			</div>
		</div>
	);
};

export default React.memo(CenteredTypography);
