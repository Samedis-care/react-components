import React from "react";
import { withKnobs } from "@storybook/addon-knobs";
import { withActions } from "@storybook/addon-actions";
import { Framework } from "../../../framework";
import BackendDataGrid from "../../../backend-components/DataGrid";

export const FormStory = (): React.ReactElement => {
	return <Framework>{/*<BackendDataGrid model={TestModel} />*/}</Framework>;
};

FormStory.storyName = "DataGrid";
FormStory.decorators = [withActions, withKnobs];
