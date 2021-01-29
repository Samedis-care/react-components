import { Paper, makeStyles, Theme } from "@material-ui/core";
import React from "react";
import BaseSelector, { BaseSelectorProps } from "./BaseSelector";

const themingStyles = makeStyles((theme: Theme) => ({
	container: {
		backgroundColor: theme.componentsCare?.selector?.container?.backgroundColor,
	},
}));

const SingleSelect = (props: BaseSelectorProps) => {
	const themingClasses = themingStyles();

	return (
		<Paper elevation={0} className={themingClasses.container}>
			<BaseSelector {...props} />
		</Paper>
	);
};

export default React.memo(SingleSelect);
