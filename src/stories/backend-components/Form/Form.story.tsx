import React from "react";
import { withKnobs } from "@storybook/addon-knobs";
// FormProps is needed because of some weird error with generics
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Form from "../../../backend-components/Form/Form";
import FormStoryModel from "./Model";
import { Button, Grid } from "@material-ui/core";
import Field from "../../../backend-components/Form/Field";
import ErrorComponent from "./ErrorComponent";
import { withActions } from "@storybook/addon-actions";

export const FormStory = (): React.ReactElement => {
	return (
		<Form model={FormStoryModel} id={null} errorComponent={ErrorComponent}>
			{({ isSubmitting }) => (
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Field name={"username"} />
					</Grid>
					<Grid item xs={4}>
						<Field name={"first_name"} />
					</Grid>
					<Grid item xs={4}>
						<Field name={"middle_name"} />
					</Grid>
					<Grid item xs={4}>
						<Field name={"last_name"} />
					</Grid>
					<Grid item xs={12}>
						<Button
							type={"submit"}
							disabled={isSubmitting}
							variant={"outlined"}
							fullWidth
						>
							Save
						</Button>
					</Grid>
				</Grid>
			)}
		</Form>
	);
};

FormStory.storyName = "Simple";
FormStory.decorators = [withActions, withKnobs];
