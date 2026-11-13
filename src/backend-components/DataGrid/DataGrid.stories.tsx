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

const FilesStory = () => {
	const model = useMemo(
		() =>
			makeModel(
				"files",
				new MockConnector([
					{
						...PEOPLE[0],
						files: [
							{
								file: {
									name: "contract.pdf",
									downloadLink: "https://example.invalid/contract.pdf",
								},
							},
							{
								file: {
									name: "annex.pdf",
									downloadLink: "https://example.invalid/annex.pdf",
								},
							},
						],
					},
					PEOPLE[1],
				]),
				{ files: true },
			),
		[],
	);
	return <BackendDataGrid model={model} />;
};

/**
 * ISSUE-3506-ITEM-13: a files cell is taller than the row: "No files present" is cut off,
 * and a second file is out of sight
 */
export const Issue3506Item13FilesCellFitsTheRow: StoryObj = {
	render: () => <FilesStory />,
	play: async ({ canvas, canvasElement }) => {
		await expect(await canvas.findByText("Alice")).toBeVisible();
		const cells = () =>
			Array.from(
				canvasElement.querySelectorAll<HTMLElement>(
					".CcDataGrid-dataCell.column-files",
				),
			);
		await waitFor(() => expect(cells()).toHaveLength(2));
		const [withFiles, withoutFiles] = cells();
		// the names, or a count such as "2 files"
		await expect(withFiles).toHaveTextContent(/contract\.pdf|2/);
		await expect(withoutFiles).toHaveTextContent("No files present");
		await expect(
			cells().map((cell) => cell.scrollHeight - cell.clientHeight),
			"how far each cell's content overflows the row",
		).toEqual([0, 0]);
	},
};

const FilesMenuStory = () => {
	const model = useMemo(
		() =>
			makeModel(
				"files-menu",
				new MockConnector([
					{
						...PEOPLE[0],
						files: [
							{
								file: {
									name: "contract.pdf",
									downloadLink: "https://example.invalid/contract.pdf",
								},
							},
							{
								file: {
									name: "annex.pdf",
									downloadLink: "https://example.invalid/annex.pdf",
								},
							},
						],
					},
					PEOPLE[1],
					{
						...PEOPLE[2],
						files: [
							{
								file: {
									name: "maintenance-report-of-the-whole-year-2026.pdf",
									downloadLink:
										"https://example.invalid/maintenance-report.pdf",
								},
							},
						],
					},
				]),
				{ files: true },
			),
		[],
	);
	return <BackendDataGrid model={model} />;
};

/**
 * ISSUE-3506-ITEM-13: the files of a row by keyboard: Tab to the count, Enter opens the
 * menu of the files on the first one, Escape closes it on the count. Opening the menu
 * neither selects the row nor moves the cell. A single file is a link on the row's line.
 * The menu is left open for the axe check.
 */
export const Issue3506Item13FilesMenuByKeyboard: StoryObj = {
	render: () => <FilesMenuStory />,
	parameters: {
		a11y: {
			test: "error",
			// the rest of the grid has its own, filed violations
			context: { include: [".column-files", "[role=menu]"] },
		},
	},
	play: async ({ canvas, canvasElement }) => {
		const body = within(document.body);
		await expect(await canvas.findByText("Alice")).toBeVisible();
		const cells = () =>
			Array.from(
				canvasElement.querySelectorAll<HTMLElement>(
					".CcDataGrid-dataCell.column-files",
				),
			);
		await waitFor(() => expect(cells()).toHaveLength(3));
		await expect(
			cells().map((cell) => cell.scrollHeight - cell.clientHeight),
			"how far each cell's content overflows the row",
		).toEqual([0, 0, 0]);
		const single = canvas.getByRole("link", {
			name: "maintenance-report-of-the-whole-year-2026.pdf",
		});
		await expect(single).toHaveAttribute(
			"href",
			"https://example.invalid/maintenance-report.pdf",
		);

		const count = canvas.getByRole("button", { name: "2 files" });
		const rowBox = canvasElement.querySelector<HTMLInputElement>(
			'.CcDataGrid-dataCell:not([class*="column-"]) input[type=checkbox]',
		)!;
		rowBox.focus();
		for (let i = 0; i < 10 && document.activeElement !== count; i++)
			await userEvent.tab();
		await expect(count).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		const menu = await body.findByRole("menu", { name: "2 files" });
		await expect(rowBox, "the row was selected").not.toBeChecked();
		const contract = within(menu).getByRole("menuitem", {
			name: "contract.pdf",
		});
		await waitFor(() => expect(contract).toHaveFocus());
		await expect(contract).toHaveAttribute(
			"href",
			"https://example.invalid/contract.pdf",
		);
		await userEvent.keyboard("{ArrowDown}");
		await expect(
			within(menu).getByRole("menuitem", { name: "annex.pdf" }),
		).toHaveFocus();
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(body.queryByRole("menu")).toBeNull());
		await waitFor(() => expect(count).toHaveFocus());
		await expect(rowBox, "the row was selected").not.toBeChecked();

		// by mouse
		await userEvent.click(count);
		const reopened = await body.findByRole("menu", { name: "2 files" });
		await expect(rowBox, "the row was selected").not.toBeChecked();
		await expect(cells()[0].scrollTop, "the cell scrolled").toBe(0);
		// the menu grows in
		await waitFor(() => expect(reopened).toBeVisible());
	},
};
