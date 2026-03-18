import React, { useCallback, useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Grid } from "@mui/material";
import { Framework } from "../../framework";
import { Form } from "./index";
import FormField from "./Field";
import DefaultFormPage from "./DefaultFormPage";
import DefaultErrorComponent from "./DefaultErrorComponent";
import createTestModel from "../../stories/test-utils/TestModel";
import { ModelFieldName, PageVisibility } from "../../backend-integration";
import { PageProps } from "./Form";

const FrameworkDecorator = (Story: React.ComponentType) => (
	<Framework>
		<Story />
	</Framework>
);

const meta: Meta = {
	title: "Backend-Components/Form",
	decorators: [FrameworkDecorator],
};

export default meta;

interface FormCustomProps {
	goBack: () => void;
}

const FormContent = (props: PageProps<ModelFieldName, FormCustomProps>) => {
	const handleGoBack = useCallback(() => {
		props.customProps.goBack();
	}, [props.customProps]);

	return (
		<DefaultFormPage
			{...props}
			customProps={{
				...props.customProps,
				goBack: handleGoBack,
				open: () => {},
				hasCustomSubmitHandler: false,
			}}
			autoBack={false}
		>
			<Grid container spacing={2}>
				<Grid size={{ xs: 6 }}>
					<FormField name="first_name" />
				</Grid>
				<Grid size={{ xs: 6 }}>
					<FormField name="last_name" />
				</Grid>
				<Grid size={{ xs: 6 }}>
					<FormField name="email" />
				</Grid>
				<Grid size={{ xs: 6 }}>
					<FormField name="department" />
				</Grid>
			</Grid>
		</DefaultFormPage>
	);
};

const CreateFormStory = () => {
	const model = useMemo(createTestModel, []);
	const goBack = useCallback(() => {
		// eslint-disable-next-line no-console
		console.log("Go back");
	}, []);
	return (
		<Form<ModelFieldName, PageVisibility, null, FormCustomProps>
			model={model}
			id={null}
			errorComponent={DefaultErrorComponent}
			customProps={{ goBack }}
			disableRouting
		>
			{FormContent}
		</Form>
	);
};

export const CreateMode: StoryObj = {
	render: () => <CreateFormStory />,
};

const EditFormStory = () => {
	const model = useMemo(createTestModel, []);
	const goBack = useCallback(() => {
		// eslint-disable-next-line no-console
		console.log("Go back");
	}, []);
	return (
		<Form<ModelFieldName, PageVisibility, null, FormCustomProps>
			model={model}
			id="1"
			errorComponent={DefaultErrorComponent}
			customProps={{ goBack }}
			disableRouting
		>
			{FormContent}
		</Form>
	);
};

export const EditMode: StoryObj = {
	render: () => <EditFormStory />,
};
