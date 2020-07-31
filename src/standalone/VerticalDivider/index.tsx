import React from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
	root: {
		display: "inline-block",
		borderRight: `1px solid ${theme.palette.divider}`,
		height: "100%",
		padding: "0",
		margin: "0 4px",
	},
}));

export default React.memo(() => {
	const classes = useStyles();

	return <div className={classes.root} />;
});
