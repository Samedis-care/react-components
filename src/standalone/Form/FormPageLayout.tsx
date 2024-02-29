import { Theme } from "@mui/material";
import React from "react";
import { Styles } from "@mui/styles";
import makeStyles from "@mui/styles/makeStyles";
import makeThemeStyles from "../../utils/makeThemeStyles";

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
	{ name: "CcFormPageLayout" },
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
	useStyles,
);

const FormPageLayout = (props: FormPageLayoutProps) => {
	const classes = useThemeStyles(props);

	return (
		<div className={classes.box}>
			<div className={classes.wrapper}>
				<div className={classes.body}>{props.body}</div>
				<div className={classes.footer}>{props.footer}</div>
			</div>
			{props.other}
		</div>
	);
};

export default React.memo(FormPageLayout);
