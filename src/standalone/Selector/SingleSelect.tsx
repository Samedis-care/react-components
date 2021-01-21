import { Paper } from "@material-ui/core";
import React from "react";
import BaseSelector, { BaseSelectorProps } from "./BaseSelector";

const SingleSelect = (props: BaseSelectorProps) => {
	return (
		<Paper elevation={0}>
			<BaseSelector {...props} />
		</Paper>
	);
};

export default React.memo(SingleSelect);
