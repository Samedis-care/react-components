import React, { useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import BackendDataGrid from "./index";
import { Framework } from "../../framework";
import createTestModel from "../../stories/test-utils/TestModel";
import { ModelFieldName, PageVisibility } from "../../backend-integration";

const FrameworkDecorator = (Story: React.ComponentType) => (
	<Framework>
		<div style={{ width: "100vw", height: "100vh" }}>
			<Story />
		</div>
	</Framework>
);

const meta: Meta = {
	title: "Backend-Components/DataGrid",
	decorators: [FrameworkDecorator],
	parameters: { layout: "fullscreen" },
};

export default meta;

const BasicDataGridStory = () => {
	const model = useMemo(createTestModel, []);
	return <BackendDataGrid model={model} />;
};

export const Basic: StoryObj = {
	render: () => <BasicDataGridStory />,
};

const WithDeleteDataGridStory = () => {
	const model = useMemo(createTestModel, []);
	return <BackendDataGrid model={model} enableDelete />;
};

export const WithDelete: StoryObj = {
	render: () => <WithDeleteDataGridStory />,
};

const WithEditDataGridStory = () => {
	const model = useMemo(createTestModel, []);
	const handleEdit = (id: string) => {
		// eslint-disable-next-line no-console
		console.log("Edit record:", id);
	};
	return (
		<BackendDataGrid<ModelFieldName, PageVisibility, null>
			model={model}
			onEdit={handleEdit}
		/>
	);
};

export const WithEdit: StoryObj = {
	render: () => <WithEditDataGridStory />,
};
