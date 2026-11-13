import React, { useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, userEvent, waitFor, within } from "storybook/test";
import BackendDataGrid from "./index";
import { Framework } from "../../framework";
import createTestModel from "../../stories/test-utils/TestModel";
import MockConnector from "../../stories/test-utils/MockConnector";
import {
	Model,
	ModelDataTypeBooleanCheckboxRendererMUI,
	ModelDataTypeFilesRenderer,
	ModelDataTypeStringRendererMUI,
	ModelFieldDefinitionUnknown,
	ModelFields,
	ModelUnknown,
	ModelVisibility,
	ModelVisibilityDisabled,
	ModelVisibilityEdit,
	ModelVisibilityGridEdit,
	ModelVisibilityGridView,
	PageVisibility,
} from "../../backend-integration";

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

/**
 * ISSUE-3495-ITEM-4: "No" in the delete confirmation unticks every selected row,
 * although nothing was deleted
 */
export const Issue3495Item4CancelledDeleteKeepsSelection: StoryObj = {
	render: () => <WithDeleteDataGridStory />,
	play: async ({ canvas, canvasElement }) => {
		const body = within(document.body);
		const checked = () =>
			canvasElement.querySelectorAll(
				".CcDataGrid-dataCell input[type=checkbox]:checked",
			).length;
		await userEvent.click(await canvas.findByText("Alice"));
		await userEvent.click(canvas.getByText("Bob"));
		await waitFor(() => expect(checked()).toBe(2));
		await userEvent.click(canvas.getByRole("button", { name: "Delete" }));
		const dialog = await body.findByRole("dialog");
		await userEvent.click(within(dialog).getByRole("button", { name: "No" }));
		await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
		await expect(canvas.getByText("Alice")).toBeVisible();
		await expect(checked(), "selected rows after No").toBe(2);
	},
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

const vis = (overview: ModelVisibility): PageVisibility => ({
	overview,
	edit: ModelVisibilityEdit,
	create: ModelVisibilityEdit,
});

interface StoryModelFields {
	/** The header of the name column */
	nameLabel?: string;
	/** Adds the inline-editable checkbox "Active" (ModelVisibilityGridEdit) */
	active?: boolean;
	/** Adds a files column */
	files?: boolean;
}

const PEOPLE = [
	{ id: "1", name: "Alice", flag: true, active: true, files: [] },
	{ id: "2", name: "Bob", flag: false, active: false, files: [] },
	{ id: "3", name: "Carol", flag: true, active: false, files: [] },
];

/**
 * A model with id, name and a Yes/No column "Flag", plus the optional fields.
 * The id is unique per call, so two models never share their queries.
 */
const makeModel = (
	name: string,
	connector: MockConnector,
	options: StoryModelFields = {},
): ModelUnknown => {
	const field = (
		label: string,
		type: ModelFieldDefinitionUnknown["type"],
		overview: ModelVisibility,
	): ModelFieldDefinitionUnknown => ({
		type,
		getLabel: () => label,
		visibility: vis(overview),
		customData: null,
	});
	const fields: ModelFields = {
		id: field(
			"ID",
			new ModelDataTypeStringRendererMUI(),
			ModelVisibilityDisabled,
		),
		name: field(
			options.nameLabel ?? "Name",
			new ModelDataTypeStringRendererMUI(),
			ModelVisibilityGridView,
		),
		flag: field(
			"Flag",
			new ModelDataTypeBooleanCheckboxRendererMUI(),
			ModelVisibilityGridView,
		),
		...(options.active && {
			active: field(
				"Active",
				new ModelDataTypeBooleanCheckboxRendererMUI(),
				ModelVisibilityGridEdit,
			),
		}),
		...(options.files && {
			files: field(
				"Files",
				new ModelDataTypeFilesRenderer(),
				ModelVisibilityGridView,
			),
		}),
	};
	return new Model(name + "-" + Math.random().toString(16), fields, connector);
};

const InlineEditStory = () => {
	const model = useMemo(
		() => makeModel("inline", new MockConnector(PEOPLE), { active: true }),
		[],
	);
	return <BackendDataGrid model={model} />;
};

/** The inline checkbox of each row's "Active" column */
const inlineBoxes = (root: HTMLElement) =>
	Array.from(
		root.querySelectorAll<HTMLInputElement>(
			".CcDataGrid-dataCell.column-active input[type=checkbox]",
		),
	);
/** The selection checkbox of each row */
const selectBoxes = (root: HTMLElement) =>
	Array.from(
		root.querySelectorAll<HTMLInputElement>(
			'.CcDataGrid-dataCell:not([class*="column-"]) input[type=checkbox]',
		),
	);

/**
 * ISSUE-3506-ITEM-12: Tab to an inline checkbox: MUI marks it focus-visible, but the only
 * cue is the ripple's faint tint
 */
export const Issue3506Item12InlineCheckboxShowsFocus: StoryObj = {
	render: () => <InlineEditStory />,
	play: async ({ canvas, canvasElement }) => {
		await expect(await canvas.findByText("Alice")).toBeVisible();
		await waitFor(() => expect(inlineBoxes(canvasElement)).toHaveLength(3));
		const box = inlineBoxes(canvasElement)[0];
		selectBoxes(canvasElement)[0].focus();
		for (let i = 0; i < 10 && document.activeElement !== box; i++)
			await userEvent.tab();
		await expect(box).toHaveFocus();
		const root = box.parentElement!;
		await waitFor(() => expect(root).toHaveClass("Mui-focusVisible"));
		const ring = (element: Element | null) => {
			if (!element) return false;
			const style = getComputedStyle(element);
			return (
				(style.outlineStyle !== "none" &&
					parseFloat(style.outlineWidth) >= 2) ||
				style.boxShadow !== "none"
			);
		};
		await expect(
			ring(root) || ring(root.querySelector(":scope > svg")),
			"no outline or ring on the focused checkbox",
		).toBe(true);
	},
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
