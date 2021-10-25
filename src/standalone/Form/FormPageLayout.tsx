import { Box, useMediaQuery, useTheme } from "@material-ui/core";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";

export interface FormPageLayoutProps {
	body: React.ReactNode;
	footer: React.ReactNode;
	other?: React.ReactNode;
}

const useStyles = makeStyles(
	{
		wrapper: {
			minHeight: "100%",
			height: "100%",
		},
		box: {
			height: "100%",
		},
		body: {
			paddingBottom: 90,
			height: "100%",
		},
		footer: {
			position: "absolute",
			bottom: 36,
			transform: "translateX(36px)",
			padding: 0,
		},
	},
	{ name: "CcFormPageLayout" }
);

const FormPageLayout = (props: FormPageLayoutProps) => {
	const theme = useTheme();
	const isXs = useMediaQuery(theme.breakpoints.only("xs"));
	const classes = useStyles();

	return (
		<Box p={isXs ? 2 : 0} className={classes.box}>
			<div className={classes.wrapper}>
				<div className={classes.body}>{props.body}</div>
				<div className={classes.footer}>{props.footer}</div>
			</div>
			{props.other}
		</Box>
	);
};

export default React.memo(FormPageLayout);
