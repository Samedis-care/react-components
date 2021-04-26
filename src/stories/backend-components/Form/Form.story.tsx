import React from "react";
import Form from "../../../backend-components/Form/Form";
import FormStoryModel from "./Model";
import ErrorComponent from "./ErrorComponent";
import SampleForm from "./SampleForm";
import { boolean } from "@storybook/addon-knobs";

export const FormStory = (): React.ReactElement => {
	return (
		<Form
			model={FormStoryModel}
			id={null}
			errorComponent={ErrorComponent}
			customProps={undefined}
			readOnly={boolean("Read-only", false)}
		>
			{SampleForm}
		</Form>
	);
};

FormStory.storyName = "Simple";
