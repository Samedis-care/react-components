import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Box, Grid } from "@mui/material";
import { DataGrid, DataGridNoPersist } from "./index";
import type {
	DataGridData,
	IDataGridColumnDef,
	IDataGridLoadDataParameters,
} from "./DataGrid";
import type { IDataGridExporter } from "./Header";

// ─── Sample data ────────────────────────────────────────────────────────────

const PEOPLE = [
	"Alice Müller",
	"Bob Smith",
	"Carol Jones",
	"Dave Brown",
	"Eve Davis",
	"Frank Wilson",
].map((name, i) => ({
	id: String(i + 1),
	name,
	role: i % 2 ? "user" : "admin",
}));

/** Applies the search to the names; the counts say 1234 people in total */
const loadPeople = ({
	page,
	rows,
	quickFilter,
}: IDataGridLoadDataParameters): DataGridData => {
	const data = PEOPLE.filter((person) =>
		person.name.toLowerCase().includes(quickFilter.toLowerCase()),
	);
	return {
		rowsTotal: 1234,
		rowsFiltered: quickFilter ? data.length : 567,
		rows: data.slice((page - 1) * rows, page * rows),
	};
};

const COLUMNS: IDataGridColumnDef[] = [
	{
		field: "name",
		headerName: "Name",
		type: "string",
		filterable: true,
		sortable: true,
	},
	{
		field: "role",
		headerName: "Role",
		type: "string",
		filterable: true,
		sortable: true,
	},
	{
		field: "id",
		headerName: "ID",
		type: "string",
		forcePin: true,
	},
];

/** An exporter whose request takes 100ms */
const EXCEL: IDataGridExporter<unknown> = {
	id: "xlsx",
	getLabel: () => "Excel",
	getWorkingLabel: () => "Exporting…",
	getReadyLabel: () => "Download",
	getErrorLabel: () => "Export failed",
	onRequest: () =>
		new Promise((resolve) => setTimeout(() => resolve("file.xlsx"), 100)),
	onDownload: () => {},
};

/** A filter bar: on phones it turns the header's buttons into "More options" */
const SimpleFilterBar = () => (
	<Grid size={12}>
		<span>Filters</span>
	</Grid>
);

const PHONE = { viewport: { value: "mobile1", isRotated: false } };

// ─── Meta ─────────────────────────────────────────────────────────────────────

/**
 * The parts of the DataGrid around the rows: the header (search, filter bar,
 * the "Columns", "Reset", "Export" and "Import" buttons, the add buttons), the
 * footer (select all, Edit, Delete, the custom actions, the row counts) and the
 * column settings panel that "Columns" opens. Their props are DataGrid props.
 */
const meta: Meta<typeof DataGrid> = {
	title: "Standalone/DataGrid/Header and Footer",
	component: DataGrid,
	decorators: [
		(Story) => (
			<Box sx={{ height: 500 }}>
				<DataGridNoPersist>
					<Story />
				</DataGridNoPersist>
			</Box>
		),
	],
	parameters: { layout: "fullscreen" },
	argTypes: {
		exporters: {
			description:
				"The Export menu's entries (IDataGridExporter). A click requests the export, a click on the ready entry downloads it.",
		},
		onImport: { description: "Shows an Import button that calls this" },
		onAddNew: {
			description:
				"A function: an enabled New button. A string: a disabled New button with this reason. An array: one button per entry.",
		},
		hideSettings: { description: 'Hides the "Columns" button' },
		hideReset: {
			description: 'Hides the "Reset" button and menu (Refresh included)',
		},
		keepExportMenuOpenAfterDownload: {
			description: "Keeps the Export menu open after a download",
		},
	},
};
export default meta;

type Story = StoryObj<typeof DataGrid>;

// ─── Stories ──────────────────────────────────────────────────────────────────

/**
 * ISSUE-3495-ITEM-18: on a phone, Enter on "Search" opens the search popover
 * with focus in its field, so what the user types right away is searched;
 * Escape closes it and focus returns to "Search"
 */
export const Issue3495Item18PhoneSearchFocusesField: Story = {
	args: { columns: COLUMNS, loadData: loadPeople },
	globals: PHONE,
	play: async ({ canvas }) => {
		const body = within(document.body);
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		const search = canvas.getByRole("button", { name: "Search" });
		search.focus();
		await userEvent.keyboard("{Enter}");
		const dialog = await body.findByRole("dialog", { name: "Search" });
		const field = within(dialog).getByRole("textbox");
		await waitFor(() => expect(field).toHaveFocus());
		await expect(search).toHaveAttribute("aria-expanded", "true");
		await userEvent.keyboard("bob");
		await expect(field).toHaveValue("bob");
		await waitFor(() =>
			expect(canvas.queryByText("Alice Müller")).not.toBeInTheDocument(),
		);
		await expect(await canvas.findByText("Bob Smith")).toBeVisible();
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(search).toHaveFocus());
		await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
		await expect(search).toHaveAttribute("aria-expanded", "false");
	},
};

/**
 * ISSUE-3495-ITEM-13: the column settings' "Visible" and "Pin" checkboxes have no
 * accessible name
 */
export const Issue3495Item13SettingsCheckboxesAreNamed: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadPeople,
		classes: { contentOverlayPaper: "story-settings" },
	},
	parameters: {
		a11y: {
			test: "error",
			context: { include: [".story-settings"] },
			options: { runOnly: { type: "rule", values: ["label"] } },
		},
	},
	play: async ({ canvas }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		await userEvent.click(canvas.getByRole("button", { name: "Columns" }));
		await expect(
			await canvas.findByRole("button", { name: "Close" }),
		).toBeVisible();
	},
};

/**
 * ISSUE-3495-ITEM-16: Enter on Delete drops keyboard focus to the page once the deleted
 * rows are unselected, because Delete turns disabled
 */
export const Issue3495Item16DeleteByKeyboardKeepsFocus: Story = {
	args: { columns: COLUMNS, loadData: loadPeople, onDelete: fn() },
	play: async ({ args, canvas, canvasElement }) => {
		await userEvent.click(await canvas.findByText("Bob Smith"));
		const del = canvas.getByRole("button", { name: "Delete" });
		await waitFor(() => expect(del).toBeEnabled());
		del.focus();
		await userEvent.keyboard("{Enter}");
		await expect(args.onDelete).toHaveBeenCalledOnce();
		// the selection is cleared once onDelete resolved
		await waitFor(() =>
			expect(
				canvasElement.querySelectorAll(
					".CcDataGrid-dataCell input[type=checkbox]:checked",
				),
			).toHaveLength(0),
		);
		await expect(document.activeElement, "focus fell to the page").not.toBe(
			document.body,
		);
	},
};

/**
 * ISSUE-3495-ITEM-16: an unavailable Delete stays in the tab order, marked
 * unavailable and dimmed, and neither Enter nor a click on it deletes. After a
 * delete by keyboard, focus stays on it.
 */
export const Issue3495Item16UnavailableDeleteKeepsFocus: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadPeople,
		onDelete: fn(),
		classes: { footer: "story-footer" },
	},
	// the footer only: the rest of the grid has violations of its own
	parameters: {
		a11y: {
			test: "error",
			context: { include: [".story-footer"] },
			options: {
				rules: {
					// the caption of the unavailable Delete: an inactive control,
					// which WCAG 1.4.3 exempts
					"color-contrast": { enabled: false },
				},
			},
		},
	},
	play: async ({ args, canvas }) => {
		await expect(await canvas.findByText("Bob Smith")).toBeVisible();
		const del = canvas.getByRole("button", { name: "Delete" });
		await expect(del).toHaveAttribute("aria-disabled", "true");
		await expect(del).toHaveClass("Mui-disabled");
		await expect(del.closest("label")).toHaveClass("Mui-disabled");
		await expect(del.tabIndex).toBe(0);
		del.focus();
		await expect(del).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await userEvent.keyboard(" ");
		// the caption is the button's label: a click on it clicks the button
		await userEvent.click(canvas.getByText("Delete"));
		await expect(args.onDelete).not.toHaveBeenCalled();

		await userEvent.click(canvas.getByText("Bob Smith"));
		await waitFor(() => expect(del).not.toHaveAttribute("aria-disabled"));
		await expect(del.closest("label")).not.toHaveClass("Mui-disabled");
		del.focus();
		await userEvent.keyboard("{Enter}");
		await expect(args.onDelete).toHaveBeenCalledOnce();
		await waitFor(() => expect(del).toHaveAttribute("aria-disabled", "true"));
		await expect(del).toHaveFocus();
	},
};

/**
 * ISSUE-3495-ITEM-1: on a phone with a filter bar, More options → Export opens the
 * Export menu, below the More options button
 */
export const Issue3495Item1PhoneExportFromMoreOptions: Story = {
	args: {
		columns: COLUMNS,
		loadData: loadPeople,
		filterBar: SimpleFilterBar,
		exporters: [EXCEL],
	},
	globals: PHONE,
	play: async ({ canvas }) => {
		const body = within(document.body);
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		const more = canvas.getByRole("button", { name: "More options" });
		await userEvent.click(more);
		await userEvent.click(
			await body.findByRole("menuitem", { name: "Export" }),
		);
		const excel = await body.findByRole("menuitem", { name: "Excel" });
		await waitFor(() => expect(excel).toBeVisible());
		const paper = excel.closest<HTMLElement>(".MuiPaper-root");
		await waitFor(async () => {
			const menuRect = paper.getBoundingClientRect();
			const buttonRect = more.getBoundingClientRect();
			// anchored to the button, not to the closed menu's Export entry
			await expect(
				Math.abs(menuRect.top - buttonRect.bottom),
			).toBeLessThanOrEqual(2);
			await expect(menuRect.left).toBeLessThan(buttonRect.right);
			await expect(menuRect.right).toBeGreaterThan(buttonRect.left);
		});
	},
};
