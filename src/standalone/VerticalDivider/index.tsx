import React from "react";
import { Theme } from "@mui/material/styles";

import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles(
	(theme: Theme) => ({
		root: {
			display: "inline-block",
			borderRight: `1px solid ${theme.palette.divider}`,
			height: "100%",
			padding: "0",
			margin: "0 4px",
		},
	}),
	{ name: "CcVerticalDivider" },
);

export interface VerticalDividerProps {
	/**
	 * Custom styles to apply
	 */
	classes?: Partial<ReturnType<typeof useStyles>>;
}

const VerticalDivider = (props: VerticalDividerProps) => {
	const classes = useStyles(props);

	return <div className={classes.root} />;
};

export default React.memo(VerticalDivider);
