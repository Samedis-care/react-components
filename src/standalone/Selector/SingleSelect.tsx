import { Paper, WithStyles } from "@material-ui/core";
import React from "react";
import { GenericWithStyles } from "../../utils";
import BaseSelector, { BaseSelectorProps } from "./BaseSelector";

const SingleSelect = (props: BaseSelectorProps & WithStyles) => {
	return (
		<Paper elevation={0}>
			<BaseSelector {...props} />
		</Paper>
	);
};

const StylesSingleSelect = React.memo(SingleSelect) as (
	props: GenericWithStyles<BaseSelectorProps & WithStyles>
) => React.ReactElement;

export default StylesSingleSelect;
