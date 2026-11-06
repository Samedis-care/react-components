import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, userEvent, waitFor, within } from "storybook/test";
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
