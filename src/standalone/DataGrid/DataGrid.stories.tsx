import React, { useCallback, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Box, Dialog, DialogContent } from "@mui/material";
import { DataGrid, DataGridNoPersist } from "./index";
import type {
	DataGridData,
	IDataGridColumnDef,
	IDataGridLoadDataParameters,
} from "./DataGrid";

// ─── Sample data ────────────────────────────────────────────────────────────

type Person = {
	id: string;
	name: string;
	age: number;
	role: string;
	active: boolean;
};

const PEOPLE: Person[] = [
	{ id: "1", name: "Alice Müller", age: 32, role: "admin", active: true },
	{ id: "2", name: "Bob Smith", age: 28, role: "user", active: true },
	{ id: "3", name: "Carol Jones", age: 45, role: "manager", active: false },
	{ id: "4", name: "Dave Brown", age: 22, role: "user", active: true },
	{ id: "5", name: "Eve Davis", age: 38, role: "admin", active: false },
	{ id: "6", name: "Frank Wilson", age: 55, role: "manager", active: true },
	{ id: "7", name: "Grace Lee", age: 29, role: "user", active: true },
	{ id: "8", name: "Henry Taylor", age: 41, role: "user", active: false },
	{ id: "9", name: "Iris Martin", age: 34, role: "admin", active: true },
	{ id: "10", name: "Jake White", age: 26, role: "user", active: true },
];

function makeLoadData(source: Person[] = PEOPLE) {
	/* eslint-disable @typescript-eslint/require-await */
	return async ({
		page,
		rows,
		quickFilter,
		sort,
	}: IDataGridLoadDataParameters): Promise<DataGridData> => {
		/* eslint-enable @typescript-eslint/require-await */
		let data = [...source];

		if (quickFilter) {
			const q = quickFilter.toLowerCase();
			data = data.filter((r) =>
				Object.values(r).some((v) => String(v).toLowerCase().includes(q)),
			);
		}

		if (sort.length > 0) {
			const { field, direction } = sort[0];
			data.sort((a, b) => {
				const av = (a as Record<string, unknown>)[field];
				const bv = (b as Record<string, unknown>)[field];
				if (av == null || bv == null) return 0;
				return av < bv ? -direction : av > bv ? direction : 0;
			});
		}

		return {
			rowsTotal: source.length,
			rowsFiltered: data.length,
			rows: data.slice((page - 1) * rows, page * rows),
		};
	};
}

// ─── Column definitions ──────────────────────────────────────────────────────

const COLUMNS: IDataGridColumnDef[] = [
	{
		field: "name",
		headerName: "Name",
		type: "string",
		filterable: true,
		sortable: true,
	},
	{
		field: "age",
		headerName: "Age",
		type: "number",
		filterable: true,
		sortable: true,
		width: [60, 100],
	},
	{
		field: "role",
		headerName: "Role",
		type: "enum",
		filterable: true,
		sortable: true,
		filterData: [
			{ value: "admin", getLabelText: () => "Admin" },
			{ value: "manager", getLabelText: () => "Manager" },
			{ value: "user", getLabelText: () => "User" },
		],
	},
	{
		field: "active",
		headerName: "Active",
		type: "boolean",
		filterable: true,
		sortable: true,
		width: [60, 100],
	},
];

// ─── Decorator ───────────────────────────────────────────────────────────────

const withGrid = (Story: React.ComponentType) => (
	<Box sx={{ height: 500 }}>
		<DataGridNoPersist>
			<Story />
		</DataGridNoPersist>
	</Box>
);

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof DataGrid> = {
	title: "Standalone/DataGrid",
	component: DataGrid,
	decorators: [withGrid],
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof DataGrid>;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Basic: Story = {
	args: {
		columns: COLUMNS,
		loadData: makeLoadData(),
	},
	play: async ({ canvas }) => {
		// Data should render
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		await expect(canvas.getByText("Bob Smith")).toBeVisible();
		// Verify footer shows total
		await expect(canvas.getByText("Total: 10")).toBeVisible();
	},
};

export const WithDefaultSort: Story = {
	args: {
		columns: COLUMNS,
		loadData: makeLoadData(),
		defaultSort: [{ field: "age", direction: -1 }],
	},
};

export const WithDefaultFilter: Story = {
	args: {
		columns: COLUMNS,
		loadData: makeLoadData(),
		defaultFilter: [
			{ field: "role", filter: { type: "inSet", value1: "admin", value2: "" } },
		],
	},
};

export const WithSelection: Story = {
	render: () => {
		const [selection, setSelection] = useState<[boolean, string[]]>([
			false,
			[],
		]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
		const loadData = useCallback(makeLoadData(), []);
		return (
			<DataGrid
				columns={COLUMNS}
				loadData={loadData}
				selection={selection}
				onSelectionChange={(invert, ids) => setSelection([invert, ids])}
				onDelete={() => {
					setSelection([false, []]);
				}}
			/>
		);
	},
};

export const WithActions: Story = {
	args: {
		columns: COLUMNS,
		loadData: makeLoadData(),
		onAddNew: () => alert("Add new"),
		onEdit: (id) => alert(`Edit ${id}`),
		onDelete: (_invert, ids) => alert(`Delete ${ids.join(", ")}`),
	},
};

export const DisabledSelection: Story = {
	args: {
		columns: COLUMNS,
		loadData: makeLoadData(),
		disableSelection: true,
	},
};

export const Empty: Story = {
	args: {
		columns: COLUMNS,
		loadData: makeLoadData([]),
	},
};

// ID columns without filterData can't show the ID selector and fall back to a text input
const COLUMNS_MANUAL_ID_FILTER: IDataGridColumnDef[] = [
	{
		field: "id",
		headerName: "ID",
		type: "id",
		filterable: true,
		width: [60, 100],
	},
	...COLUMNS,
];

// fixed initial widths keep these out of the "distribute the leftover space"
// pass, so the grid genuinely overflows a dialog sized viewport
const WIDE_COLUMNS: IDataGridColumnDef[] = [
	...COLUMNS,
	...Array.from({ length: 8 }, (_, i): IDataGridColumnDef => ({
		field: `extra${i + 1}`,
		headerName: `Extra ${i + 1}`,
		type: "string",
		width: [200, 200, 200],
	})),
];

/**
 * The reported case: a grid too wide for the dialog it sits in. The dialog paper
 * holds focus from the moment it opens and a click on a cell resolves to the
 * nearest focusable ancestor, so before the scrolling pane became a tab stop that
 * ancestor was the paper and the arrow keys had nothing scrollable to work on.
 */
export const InDialog: Story = {
	render: () => {
		// eslint-disable-next-line react-hooks/exhaustive-deps
		const loadData = useCallback(makeLoadData(), []);
		return (
			<Dialog open fullWidth maxWidth={"sm"}>
				<DialogContent>
					<Box sx={{ height: 400 }}>
						<DataGrid columns={WIDE_COLUMNS} loadData={loadData} />
					</Box>
				</DialogContent>
			</Dialog>
		);
	},
	play: async () => {
		// the dialog renders into a portal, so it is outside the story canvas
		const body = within(document.body);
		await expect(await body.findByText("Alice Müller")).toBeVisible();

		// the scrolling pane is the only one of the four that is a tab stop
		const panes = body
			.getAllByRole("grid")
			.filter((grid) => grid.tabIndex === 0);
		await expect(panes).toHaveLength(1);
		const [pane] = panes;

		// an unnamed grid as a tab stop would be announced without any context
		await expect(pane.getAttribute("aria-label")).toBeTruthy();

		// it really is the overflowing one, and it really is the scroller
		await expect(pane.scrollWidth).toBeGreaterThan(pane.clientWidth);

		// the fix: the click lands focus here instead of leaving it on the paper,
		// which is what the browser reads to decide where arrow keys scroll
		await userEvent.click(within(pane).getByText("Alice Müller"));
		await waitFor(() => expect(pane).toHaveFocus());
	},
};

export const ManualIdFilter: Story = {
	args: {
		columns: COLUMNS_MANUAL_ID_FILTER,
		loadData: makeLoadData(),
	},
	play: async ({ canvas }) => {
		const body = within(document.body);

		await userEvent.click(canvas.getAllByRole("button", { name: "Filter" })[0]);

		// no ID selector, but the plain text filter used by the string columns
		const filterType = await body.findByRole("combobox");
		await waitFor(() => expect(filterType).toBeVisible());
		await expect(filterType).toHaveTextContent("Equals");

		const filterValue = body.getByRole("textbox");
		await userEvent.type(filterValue, "3");
		await expect(filterValue).toHaveValue("3");
	},
};
