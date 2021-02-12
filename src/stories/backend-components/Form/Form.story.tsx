import React from "react";
import Form from "../../../backend-components/Form/Form";
import FormStoryModel from "./Model";
import ErrorComponent from "./ErrorComponent";
import SampleForm from "./SampleForm";

export const FormStory = (): React.ReactElement => {
	return (
		<Form
			model={FormStoryModel}
			id={null}
			errorComponent={ErrorComponent}
			customProps={undefined}
		>
			{SampleForm}
		</Form>
	);
};

FormStory.storyName = "Simple";
