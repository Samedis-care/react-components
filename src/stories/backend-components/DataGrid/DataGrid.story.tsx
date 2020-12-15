import React from "react";
import { withKnobs } from "@storybook/addon-knobs";
import { withActions } from "@storybook/addon-actions";
import BackendDataGrid from "../../../backend-components/DataGrid";
import TestModel from "./TestModel";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
	wrapper: {
		height: "75vh",
	},
});

export const FormStory = (): React.ReactElement => {
	const classes = useStyles();

	return (
		<div className={classes.wrapper}>
			<BackendDataGrid enableDelete model={TestModel} />
		</div>
	);
};

FormStory.storyName = "DataGrid";
FormStory.decorators = [withActions, withKnobs];
