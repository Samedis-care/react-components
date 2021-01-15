import React from "react";
import ErrorComponent from "../Form/ErrorComponent";
import SampleForm from "../Form/SampleForm";
import CRUD from "../../../backend-components/CRUD";
import TestModelInstance from "../DataGrid/TestModel";

export const CrudStory = (): React.ReactElement => {
	return (
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
	);
};

CrudStory.storyName = "CRUD";
