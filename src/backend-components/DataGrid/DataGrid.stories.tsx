import React, { useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, userEvent, waitFor, within } from "storybook/test";
import BackendDataGrid from "./index";
import { Framework } from "../../framework";
import createTestModel from "../../stories/test-utils/TestModel";
import { ModelUnknown } from "../../backend-integration";

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
	return <BackendDataGrid<ModelUnknown> model={model} onEdit={handleEdit} />;
};

export const WithEdit: StoryObj = {
	render: () => <WithEditDataGridStory />,
};

/**
 * ISSUE-3495-ITEM-16: after a delete by keyboard and Yes in the confirmation,
 * focus returns to Delete and stays there once the reload has cleared the
 * selection
 */
export const Issue3495Item16DeleteByKeyboardKeepsFocusAfterYes: StoryObj = {
	render: () => <WithDeleteDataGridStory />,
	play: async ({ canvas }) => {
		const body = within(document.body);
		await userEvent.click(await canvas.findByText("Alice"));
		const del = canvas.getByRole("button", { name: "Delete" });
		await waitFor(() => expect(del).not.toHaveAttribute("aria-disabled"));
		del.focus();
		await userEvent.keyboard("{Enter}");
		const dialog = await body.findByRole("dialog");
		await userEvent.click(within(dialog).getByRole("button", { name: "Yes" }));
		await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
		await waitFor(() => expect(canvas.getByText(/Total: 7/)).toBeVisible(), {
			timeout: 3000,
		});
		const delAfter = canvas.getByRole("button", { name: "Delete" });
		await expect(delAfter).toHaveAttribute("aria-disabled", "true");
		await expect(delAfter, "focus left Delete").toHaveFocus();
	},
};
