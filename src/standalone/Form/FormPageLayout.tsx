import { Box, Theme, useMediaQuery, useTheme } from "@material-ui/core";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Styles } from "@material-ui/core/styles/withStyles";
import { makeThemeStyles } from "../../utils";

export interface FormPageLayoutProps {
	body: React.ReactNode;
	footer: React.ReactNode;
	other?: React.ReactNode;
}

const useStyles = makeStyles(
	{
		wrapper: {
			flexGrow: 1,
			display: "flex",
			flexDirection: "column",
		},
		box: {
			flexGrow: 1,
			display: "flex",
			flexDirection: "column",
		},
		body: {
			paddingBottom: 150,
			flexGrow: 1,
			display: "flex",
			flexDirection: "column",
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

export type FormPageLayoutClassKey = keyof ReturnType<typeof useStyles>;

export type FormPageLayoutTheme = Partial<
	Styles<Theme, FormPageLayoutProps, FormPageLayoutClassKey>
>;

const useThemeStyles = makeThemeStyles<
	FormPageLayoutProps,
	FormPageLayoutClassKey
>(
	(theme) => theme.componentsCare?.uiKit?.formPage?.layout,
	"CcFormPageLayout",
	useStyles
);

const FormPageLayout = (props: FormPageLayoutProps) => {
	const theme = useTheme();
	const isXs = useMediaQuery(theme.breakpoints.only("xs"));
	const classes = useThemeStyles(props);

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
