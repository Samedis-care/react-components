import { Paper } from "@material-ui/core";
import React from "react";
import BaseSelector, { BaseSelectorProps } from "./BaseSelector";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
	wrapper: {
		marginTop: 16, // to accommodate InputLabel
	},
});

const SingleSelect = (props: BaseSelectorProps) => {
	const classes = useStyles();

	return (
		<Paper elevation={0} className={classes.wrapper}>
			<BaseSelector {...props} />
		</Paper>
	);
};

export default React.memo(SingleSelect);
