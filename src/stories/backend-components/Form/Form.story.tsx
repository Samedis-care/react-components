import React from "react";
import { withKnobs } from "@storybook/addon-knobs";
import Form from "../../../backend-components/Form/Form";
import FormStoryModel from "./Model";
import ErrorComponent from "./ErrorComponent";
import { withActions } from "@storybook/addon-actions";
import SampleForm from "./SampleForm";

export const FormStory = (): React.ReactElement => {
	return (
		<Form model={FormStoryModel} id={null} errorComponent={ErrorComponent}>
			{SampleForm}
		</Form>
	);
};

FormStory.storyName = "Simple";
FormStory.decorators = [withActions, withKnobs];
