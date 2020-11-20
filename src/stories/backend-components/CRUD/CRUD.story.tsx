import React from "react";
import { withKnobs } from "@storybook/addon-knobs";
import ErrorComponent from "../Form/ErrorComponent";
import { withActions } from "@storybook/addon-actions";
import { Framework } from "../../../framework";
import SampleForm from "../Form/SampleForm";
import CRUD from "../../../backend-components/CRUD";
import TestModelInstance from "../DataGrid/TestModel";

export const CrudStory = (): React.ReactElement => {
	return (
		<Framework>
			<CRUD
				model={TestModelInstance}
				formProps={{ errorComponent: ErrorComponent }}
				gridProps={{}}
				deletePermission={"sample.delete"}
				editPermission={"sample.edit"}
				newPermission={"sample.new"}
				exportPermission={"sample.export"}
			>
				{SampleForm}
			</CRUD>
		</Framework>
	);
};

CrudStory.storyName = "CRUD";
CrudStory.decorators = [withActions, withKnobs];
