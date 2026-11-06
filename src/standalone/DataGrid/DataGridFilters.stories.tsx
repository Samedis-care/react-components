import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DataGrid, DataGridNoPersist } from "./index";
import type {
	DataGridData,
	DataGridProps,
	IDataGridColumnDef,
	IDataGridLoadDataParameters,
} from "./DataGrid";

// ─── Sample data ────────────────────────────────────────────────────────────

type Task = {
	id: string;
	name: string;
	age: number;
	role: string;
	status: string;
	kind: string;
	active: boolean;
	updated: string;
	price: number;
};

const TASKS: Task[] = [
	["Alice Müller", 32, "admin", "open", "alpha", true],
	["Bob Smith", 28, "user", "done", "beta", true],
	["Carol Jones", 45, "manager", "open", "beta", false],
	["Dave Brown", 22, "user", "lost", "gamma", true],
	["Eve Davis", 38, "admin", "done", "alpha", false],
	["Frank Wilson", 55, "manager", "open", "gamma", true],
].map(([name, age, role, status, kind, active], i) => ({
	id: String(i + 1),
	name: name as string,
	age: age as number,
	role: role as string,
	status: status as string,
	kind: kind as string,
	active: active as boolean,
	updated: "2026-08-01T10:00:00.000Z",
	price: 10 * (i + 1),
}));

/** the columns whose filters loadTasks applies */
const FILTERED_FIELDS = ["name", "role", "active", "status"];
/**
 * Applies the custom data of the filter bars below (status, kinds) and the
 * first condition of the name, role, active and status column filters
 */

const loadTasks = ({
	page,
	rows,
	additionalFilters,
	fieldFilter,
}: IDataGridLoadDataParameters): DataGridData => {
	let data = [...TASKS];
	if (additionalFilters.status)
		data = data.filter((r) => r.status === additionalFilters.status);
	const kinds = additionalFilters.kinds as string[] | undefined;
	if (kinds?.length) data = data.filter((r) => kinds.includes(r.kind));
	Object.entries(fieldFilter).forEach(([field, filter]) => {
		const value = (row: Task) => String(row[field as keyof Task]).toLowerCase();
		const wanted = filter.value1.toLowerCase();
		if (!wanted || !FILTERED_FIELDS.includes(field)) return;
		if (filter.type === "inSet")
			data = data.filter((r) => wanted.split(",").includes(value(r)));
		else if (filter.type === "equals")
			data = data.filter((r) => value(r) === wanted);
		else if (filter.type === "startsWith")
			data = data.filter((r) => value(r).startsWith(wanted));
		else if (filter.type === "contains")
			data = data.filter((r) => value(r).includes(wanted));
	});
	return {
		rowsTotal: TASKS.length,
		rowsFiltered: data.length,
		rows: data.slice((page - 1) * rows, page * rows),
	};
};

const ROLE_FILTER = [
	{ value: "admin", getLabelText: () => "Admin" },
	{ value: "manager", getLabelText: () => "Manager" },
	{ value: "user", getLabelText: () => "User" },
];

const COLUMNS: IDataGridColumnDef[] = [
	{ field: "name", headerName: "Name", type: "string", filterable: true },
	{
		field: "age",
		headerName: "Age",
		type: "number",
		filterable: true,
		width: [60, 100],
	},
	{
		field: "role",
		headerName: "Role",
		type: "enum",
		filterable: true,
		filterData: ROLE_FILTER,
	},
	{
		field: "active",
		headerName: "Active",
		type: "boolean",
		filterable: true,
		width: [60, 100],
	},
];

// ─── Decorator ───────────────────────────────────────────────────────────────

const withGrid = (Story: React.ComponentType) => (
	<LocalizationProvider dateAdapter={AdapterMoment}>
		<Box sx={{ height: 500 }}>
			<DataGridNoPersist>
				<Story />
			</DataGridNoPersist>
		</Box>
	</LocalizationProvider>
);

// ─── Meta ─────────────────────────────────────────────────────────────────────

/**
 * Filtering in the DataGrid: the column filters (the popup behind each
 * filterable column's "Filter" button), and the filter bar for the grid's
 * custom data with its helpers GridSingleSelectFilter, GridMultiSelectFilter,
 * GridSingleSelectFilterBackend and GridMultiSelectFilterBackend. Below
 * `enableFilterDialogWidth` the bar turns into a "Filter" button that opens it
 * in a panel over the rows.
 */
const meta: Meta<typeof DataGrid> = {
	title: "Standalone/DataGrid/Filters",
	component: DataGrid,
	decorators: [withGrid],
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof DataGrid>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** The header content of a column (`column-header-<field>`) */
const headerOf = (root: HTMLElement, field: string) =>
	root.querySelector<HTMLElement>(`[class~="column-header-${field}"]`);

/** The header "Filter" button of a column */
const filterButtonOf = (root: HTMLElement, field: string) =>
	within(headerOf(root, field)!).getByRole("button", { name: /filter/i });

/** The open column filter popup (the header's hidden menus are popovers too) */
const openPopup = () =>
	waitFor(() => {
		const paper = document.querySelector<HTMLElement>(
			".MuiPopover-root:not(.MuiModal-hidden) .MuiPopover-paper",
		);
		if (!paper) throw new Error("the filter popup is not open");
		return paper;
	});

/** Class hooks for the parts the stories look at */
const STORY_CLASSES: DataGridProps["classes"] = {
	columnHeaderFilterPopup: "story-filter-popup",
	columnHeaderFilterPopupEnum: "story-filter-popup",
	columnHeaderFilterPopupDateTime: "story-filter-popup",
	filterClearBtn: "story-clear-filter",
	customFilterContainerHeader: "story-filter-panel-title",
};

/**
 * ISSUE-3494-ITEM-16: in an enum column's filter every checkbox is unnamed ("checkbox,
 * not checked"); axe's label rule fails on the open popup
 */
export const Issue3494Item16EnumFilterCheckboxesAreNamed: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadTasks,
		classes: STORY_CLASSES,
	},
	parameters: {
		a11y: {
			test: "error",
			context: { include: [".story-filter-popup"] },
			options: { runOnly: { type: "rule", values: ["label"] } },
		},
	},
	play: async ({ canvas, canvasElement }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		await userEvent.click(filterButtonOf(canvasElement, "role"));
		const paper = await openPopup();
		await expect(paper.querySelectorAll("input[type=checkbox]")).toHaveLength(
			4,
		);
	},
};

/**
 * ISSUE-3494-ITEM-19: between two conditions of a text column's filter, AND and OR
 * are two toggle buttons named "Combine conditions". A click on the word already
 * picked keeps it, a click on the other word picks that one, and axe finds
 * nothing on the group. It is no taller than the value field.
 */
export const Issue3494Item19AndOrAreToggleButtons: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadTasks,
		classes: STORY_CLASSES,
	},
	parameters: {
		a11y: {
			test: "error",
			context: { include: ['[aria-label="Combine conditions"]'] },
		},
	},
	play: async ({ canvas, canvasElement }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		await userEvent.click(filterButtonOf(canvasElement, "name"));
		const paper = await openPopup();
		const value = within(paper).getByRole("textbox");
		await userEvent.type(value, "a");
		const group = await within(paper).findByRole("group", {
			name: "Combine conditions",
		});
		const and = within(group).getByRole("button", { name: "AND" });
		const or = within(group).getByRole("button", { name: "OR" });
		await expect(and).toHaveAttribute("aria-pressed", "true");
		await userEvent.click(and);
		await expect(and).toHaveAttribute("aria-pressed", "true");
		await userEvent.click(or);
		await expect(or).toHaveAttribute("aria-pressed", "true");
		await expect(and).toHaveAttribute("aria-pressed", "false");
		await expect(group.getBoundingClientRect().height).toBeLessThanOrEqual(
			value.getBoundingClientRect().height,
		);
	},
};
