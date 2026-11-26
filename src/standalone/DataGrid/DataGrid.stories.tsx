import React, { useCallback, useContext, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, mocked, userEvent, waitFor, within } from "storybook/test";
import {
	Box,
	Button,
	Dialog,
	DialogContent,
	TextField,
	Typography,
} from "@mui/material";
import {
	Mail as MailIcon,
	PlaylistAdd as PlaylistAddIcon,
} from "@mui/icons-material";
import {
	DataGrid,
	DataGridLocalStoragePersist,
	DataGridNoPersist,
	DataGridStorageManagerPersist,
} from "./index";
import type {
	DataGridCustomDataActionButton,
	DataGridData,
	DataGridDispatch,
	DataGridFilterSetting,
	IDataGridColumnDef,
	IDataGridLoadDataParameters,
} from "./DataGrid";
import type { IDataGridFilterBarProps } from "./Header/FilterBar";
import {
	DATA_GRID_PERSIST_VERSION,
	type DataGridPersistentState,
} from "./PersistFormat";
import {
	DATA_GRID_STORAGE_KEY_COLUMN_SIZING,
	DATA_GRID_STORAGE_KEY_FILTERS,
} from "./StorageManagerPersist";
import {
	DefaultGetStorageProviderCallback,
	StorageManager,
	StorageProvider,
} from "../../framework/Storage";

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
		additionalFilters,
		sort,
	}: IDataGridLoadDataParameters): Promise<DataGridData> => {
		/* eslint-enable @typescript-eslint/require-await */
		let data = [...source];

		if (additionalFilters.role) {
			data = data.filter((r) => r.role === additionalFilters.role);
		}

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
	play: async ({ canvas, canvasElement }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		// the cell hides its children's overflow, so the checkbox root clips
		// the row's box: a round root would cut it down to a circle, and one
		// rounder than the box would cut through the box's border
		const root = canvasElement.querySelector(
			".CcDataGrid-dataCell .MuiCheckbox-root",
		)!;
		await expect(getComputedStyle(root).overflow).toBe("hidden");
		// the theme's shape radius (4px) instead of MUI's round root
		await expect(getComputedStyle(root).borderTopLeftRadius).toBe("4px");
		await expect(
			getComputedStyle(root.querySelector(":scope > svg")!).borderTopLeftRadius,
		).toBe("4px");
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

const makeSelectAllButtons = (): DataGridCustomDataActionButton[] => [
	{
		icon: <PlaylistAddIcon />,
		label: "Add to list",
		isDisabled: (numSelected) => numSelected === 0,
		supportsSelectAll: true,
		onClick: fn(),
	},
	{
		icon: <MailIcon />,
		label: "Invite",
		isDisabled: (numSelected) => numSelected === 0,
		onClick: fn(),
	},
];

/**
 * Select all selects every row the grid shows (here: the users, through custom
 * data), loaded or not. Its checkbox is in the footer and in the header of the
 * selection column. "Add to list" supports it and gets the inverted
 * selection with the filter, the count and the loaded rows. "Invite" doesn't,
 * and delete without enableDeleteAll doesn't either: both are disabled while
 * everything is selected.
 */
export const WithSelectAll: Story = {
	args: {
		columns: COLUMNS,
		loadData: makeLoadData(),
		defaultCustomData: { role: "user" },
		enableSelectAll: true,
		onDelete: fn(),
		customDataActionButtons: makeSelectAllButtons(),
	},
	play: async ({ args, canvas }) => {
		const body = within(document.body);
		await expect(await canvas.findByText("Bob Smith")).toBeVisible();
		await expect(canvas.queryByText("Alice Müller")).not.toBeInTheDocument();

		const [header, all] = canvas.getAllByRole("checkbox", { name: "All" });
		await expect(header.closest(".CcDataGrid-headerCell")).not.toBeNull();
		const deleteButton = canvas.getByRole("button", { name: "Delete" });
		// a row ticked before doesn't carry over: select all selects everything
		await userEvent.click(canvas.getByText("Dave Brown"));
		await expect(all).toBePartiallyChecked();
		await expect(header).toBePartiallyChecked();
		await userEvent.click(all);
		await expect(all).toBeChecked();
		await expect(header).toBeChecked();
		// unselects Bob again
		await userEvent.click(canvas.getByText("Bob Smith"));
		await expect(all).toBePartiallyChecked();
		await expect(header).toBePartiallyChecked();
		await expect(deleteButton).toHaveAttribute("aria-disabled", "true");

		// on xs the custom buttons are in the "More" menu
		const more = canvas.queryByRole("button", { name: "More" });
		if (more) await userEvent.click(more);
		const actionRole = more ? "menuitem" : "button";
		const isDisabled = (element: HTMLElement) =>
			element.matches(":disabled") ||
			element.getAttribute("aria-disabled") === "true";
		await expect(
			isDisabled(await body.findByRole(actionRole, { name: "Invite" })),
		).toBe(true);
		const add = body.getByRole(actionRole, { name: "Add to list" });
		await expect(isDisabled(add)).toBe(false);

		await userEvent.click(add);
		const onAdd = args.customDataActionButtons?.[0].onClick;
		await expect(onAdd).toHaveBeenCalledTimes(1);
		await expect(onAdd).toHaveBeenCalledWith(true, ["2"], {
			filter: {
				quickFilter: "",
				additionalFilters: { role: "user" },
				fieldFilter: {},
			},
			// of the 5 users, not of all 10 people
			count: 4,
			rows: ["4", "7", "8", "10"].map((id) =>
				PEOPLE.find((person) => person.id === id),
			),
		});
		await expect(args.onDelete).not.toHaveBeenCalled();

		// a click on the partial selection selects everything, the next one nothing
		await userEvent.click(all);
		await expect(all).toBeChecked();
		await userEvent.click(all);
		await expect(all).not.toBeChecked();
		await expect(all).not.toBePartiallyChecked();
		await expect(deleteButton).toHaveAttribute("aria-disabled", "true");

		// the header checkbox is the same control, by keyboard too
		header.focus();
		await userEvent.keyboard(" ");
		await expect(header).toBeChecked();
		await expect(all).toBeChecked();
		await expect(deleteButton).toHaveAttribute("aria-disabled", "true");
		await userEvent.keyboard(" ");
		await expect(header).not.toBeChecked();
		await expect(all).not.toBeChecked();
	},
};

/**
 * The same on a phone, where the custom buttons are in the "More" menu
 */
export const WithSelectAllOnPhone: Story = {
	...WithSelectAll,
	args: {
		...WithSelectAll.args,
		onDelete: fn(),
		customDataActionButtons: makeSelectAllButtons(),
	},
	globals: { viewport: { value: "mobile1", isRotated: false } },
	play: async (context) => {
		await expect(
			await context.canvas.findByRole("button", { name: "More" }),
		).toBeVisible();
		await WithSelectAll.play?.(context);
	},
};

const MANY_PEOPLE: Person[] = Array.from({ length: 120 }, (_, index) => ({
	id: String(index + 1),
	name: `Person ${index + 1}`,
	age: 20 + (index % 50),
	role: ["admin", "manager", "user"][index % 3],
	active: index % 2 === 0,
}));
const FIRST_50_IDS = MANY_PEOPLE.slice(0, 50).map((person) => person.id);

/**
 * With limitSelectAll 50, select all selects the first 50 of the 120 rows by
 * their ids. The grid has loaded the first page (25 rows), so it
 * loads the second one. The selection isn't inverted: delete and "Invite",
 * which doesn't support select all, work with it.
 */
export const WithLimitedSelectAll: Story = {
	args: {
		columns: COLUMNS,
		loadData: fn(makeLoadData(MANY_PEOPLE)),
		searchPlaceholder: "Search",
		enableSelectAll: true,
		limitSelectAll: 50,
		onSelectionChange: fn(),
		onDelete: fn(),
		customDataActionButtons: makeSelectAllButtons(),
	},
	play: async ({ args, canvas }) => {
		await expect(await canvas.findByText("Person 1")).toBeVisible();
		const loadData = mocked(args.loadData);
		await expect(loadData).toHaveBeenCalledTimes(1);

		// more rows match than the limit
		const [header, first] = canvas.getAllByRole("checkbox", {
			name: "First 50",
		});
		await expect(header.closest(".CcDataGrid-headerCell")).not.toBeNull();
		await userEvent.click(header);
		await waitFor(() =>
			expect(args.onSelectionChange).toHaveBeenLastCalledWith(
				false,
				FIRST_50_IDS,
			),
		);
		await expect(header).toBeChecked();
		await expect(first).toBeChecked();
		await expect(loadData).toHaveBeenCalledTimes(2);
		await expect(loadData).toHaveBeenLastCalledWith(
			expect.objectContaining({ page: 2, rows: 25 }),
		);

		await expect(
			canvas.getByRole("button", { name: "Delete" }),
		).not.toHaveAttribute("aria-disabled");
		const invite = canvas.getByRole("button", { name: "Invite" });
		await expect(invite).toBeEnabled();
		await userEvent.click(invite);
		await expect(
			args.customDataActionButtons?.[1].onClick,
		).toHaveBeenCalledWith(false, FIRST_50_IDS, {
			filter: { quickFilter: "", additionalFilters: {}, fieldFilter: {} },
			count: 50,
			// the grid keeps the page loaded for select all
			rows: MANY_PEOPLE.slice(0, 50),
		});

		// a row unticked and ticked again: the same 50 rows are selected
		await userEvent.click(canvas.getByText("Person 3"));
		await expect(first).toBePartiallyChecked();
		await expect(header).toBePartiallyChecked();
		await userEvent.click(canvas.getByText("Person 3"));
		await expect(args.onSelectionChange).toHaveBeenLastCalledWith(false, [
			...FIRST_50_IDS.filter((id) => id !== "3"),
			"3",
		]);
		await expect(first).toBeChecked();
		await expect(header).toBeChecked();

		// a click on the selection clears it
		await userEvent.click(first);
		await expect(first).not.toBeChecked();
		await expect(first).not.toBePartiallyChecked();
		await expect(args.onSelectionChange).toHaveBeenLastCalledWith(false, []);

		// all of them if no more match than the limit
		await userEvent.type(canvas.getByPlaceholderText("Search"), "Person 1");
		await expect(
			await canvas.findByText("Filtered: 32 Total: 120", {}, { timeout: 3000 }),
		).toBeVisible();
		await userEvent.click(canvas.getAllByRole("checkbox", { name: "All" })[1]);
		await waitFor(() =>
			expect(args.onSelectionChange).toHaveBeenLastCalledWith(
				false,
				MANY_PEOPLE.filter((person) => person.name.includes("Person 1")).map(
					(person) => person.id,
				),
			),
		);
		for (const all of canvas.getAllByRole("checkbox", { name: "All" }))
			await expect(all).toBeChecked();

		// nothing matches: there is nothing to select, so it doesn't stay ticked
		const all = canvas.getAllByRole("checkbox", { name: "All" })[1];
		await userEvent.click(all);
		await userEvent.type(canvas.getByPlaceholderText("Search"), "x");
		await expect(
			await canvas.findByText("Filtered: 0 Total: 120", {}, { timeout: 3000 }),
		).toBeVisible();
		const loads = loadData.mock.calls.length;
		await userEvent.click(all);
		await waitFor(() => expect(loadData).toHaveBeenCalledTimes(loads + 1));
		await waitFor(() => expect(all).not.toHaveAttribute("aria-busy"));
		await expect(all).not.toBeChecked();
	},
};

/**
 * The rows the limited select all loads arrive after the click. A click
 * meanwhile, in the footer or the header, unticks it again, a row ticked meanwhile stays the selection, and
 * a failed load leaves the selection as it was and reports the error.
 */
export const LimitedSelectAllWhileLoading: Story = {
	args: {
		columns: COLUMNS,
		loadData: fn(makeLoadData(MANY_PEOPLE)),
		enableSelectAll: true,
		limitSelectAll: 50,
		onSelectionChange: fn(),
		onError: fn(),
	},
	play: async ({ args, canvas }) => {
		await expect(await canvas.findByText("Person 1")).toBeVisible();
		const loadData = mocked(args.loadData);
		const onSelectionChange = mocked(args.onSelectionChange!);
		const [header, first] = canvas.getAllByRole("checkbox", {
			name: "First 50",
		});
		let release = () => {};
		const holdSecondPage = () =>
			new Promise<DataGridData>((resolve) => {
				release = () =>
					resolve({
						rowsTotal: 120,
						rowsFiltered: 120,
						rows: MANY_PEOPLE.slice(25, 50),
					});
			});

		// checked and busy while the second page loads, a click unticks it
		loadData.mockImplementationOnce(holdSecondPage);
		await userEvent.click(first);
		await expect(first).toBeChecked();
		await expect(first).toHaveAttribute("aria-busy", "true");
		await expect(header).toBeChecked();
		await expect(header).toHaveAttribute("aria-busy", "true");
		await userEvent.click(header);
		for (const checkbox of [header, first]) {
			await expect(checkbox).not.toBeChecked();
			await expect(checkbox).not.toHaveAttribute("aria-busy");
		}
		release();

		const error = new Error("offline");
		loadData.mockRejectedValueOnce(error);
		await userEvent.click(first);
		await waitFor(() => expect(args.onError).toHaveBeenCalledWith(error));
		await expect(first).not.toBeChecked();
		await expect(first).not.toHaveAttribute("aria-busy");

		// the click on the row comes later than the one on select all
		loadData.mockImplementationOnce(holdSecondPage);
		await userEvent.click(first);
		await userEvent.click(canvas.getByText("Person 3"));
		await expect(first).toBePartiallyChecked();
		await expect(first).not.toHaveAttribute("aria-busy");
		await expect(onSelectionChange).toHaveBeenLastCalledWith(false, ["3"]);
		release();

		// select all reads the second page the dropped one left in the grid, so
		// it has arrived before this click, and the row stayed selected
		const calls = loadData.mock.calls.length;
		await userEvent.click(first);
		await waitFor(() => expect(first).toBeChecked());
		await expect(loadData).toHaveBeenCalledTimes(calls);
		await expect(onSelectionChange.mock.calls.slice(-2)).toEqual([
			[false, ["3"]],
			[false, FIRST_50_IDS],
		]);
		// the unticked and the failed select all selected nothing
		await expect(
			onSelectionChange.mock.calls.filter(([, ids]) => ids.length === 50),
		).toHaveLength(1);
	},
};

export const DisabledSelection: Story = {
	args: {
		columns: COLUMNS,
		loadData: makeLoadData(),
		disableSelection: true,
	},
};

/**
 * Rewriting a loaded row through the grid's ref, the way a caller would after
 * their own mutation returned the updated record. The row stays where it is and
 * no data is loaded again - until the next refresh, which loads the row from
 * loadData and undoes this.
 */
export const ImperativeRowUpdate: Story = {
	render: () => {
		const gridRef = useRef<DataGridDispatch>(null);
		// eslint-disable-next-line react-hooks/exhaustive-deps
		const loadData = useCallback(makeLoadData(), []);
		const promote = useCallback(
			() =>
				gridRef.current?.updateRow("2", (row) => ({
					role: "manager",
					age: (row.age as number) + 5,
				})),
			[],
		);
		return (
			<Box
				sx={{
					height: "100%",
					display: "flex",
					flexDirection: "column",
					gap: 1,
				}}
			>
				<Button onClick={promote} variant={"contained"}>
					Promote Bob
				</Button>
				<Box sx={{ flexGrow: 1, minHeight: 0 }}>
					<DataGrid ref={gridRef} columns={COLUMNS} loadData={loadData} />
				</Box>
			</Box>
		);
	},
	play: async ({ canvas }) => {
		await expect(await canvas.findByText("Bob Smith")).toBeVisible();
		await expect(canvas.getByText("28")).toBeVisible();

		await userEvent.click(canvas.getByRole("button", { name: "Promote Bob" }));

		// the updated fields are shown, the ones left out of the update stay
		await waitFor(() => expect(canvas.getByText("33")).toBeVisible());
		await expect(canvas.queryByText("28")).not.toBeInTheDocument();
		await expect(canvas.getAllByText("manager")).toHaveLength(3);
		await expect(canvas.getByText("Bob Smith")).toBeVisible();

		// still the same 10 rows, nothing was loaded again
		await expect(canvas.getByText("Total: 10")).toBeVisible();
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

// ─── Persistence ─────────────────────────────────────────────────────────────

const PERSIST_STORAGE_KEY = "cc-storybook-data-grid-persist";

// "Active" is hidden by default, "Internal Note" was added to the model after
// the user last opened this grid
const COLUMNS_PERSIST: IDataGridColumnDef[] = [
	...COLUMNS.map((column) =>
		column.field === "active" ? { ...column, hidden: true } : column,
	),
	{
		field: "internal_note",
		headerName: "Internal Note",
		type: "string",
		hidden: true,
	},
];

/**
 * A user who has been using this grid since before "Internal Note" existed, so
 * their stored state is in the pre-versioning format and mentions only the
 * columns which existed back then.
 *
 * The new column is not in that data, so it follows its definition and starts
 * hidden. "Active" is hidden by definition too, but the stored data knows the
 * column and has it visible - that's the user's own choice and it stays.
 */
export const NewColumnUsesDefaults: Story = {
	beforeEach: () => {
		localStorage.setItem(
			PERSIST_STORAGE_KEY,
			JSON.stringify({
				columnState: {
					name: { sort: 0 },
					age: { sort: 0 },
					role: { sort: 0 },
					active: {
						sort: 0,
						filter: { type: "equals", value1: "", value2: "" },
					},
				},
				state: {
					search: "",
					hiddenColumns: ["role"],
					lockedColumns: [],
					customData: {},
				},
			}),
		);
		return () => localStorage.removeItem(PERSIST_STORAGE_KEY);
	},
	render: () => {
		// eslint-disable-next-line react-hooks/exhaustive-deps
		const loadData = useCallback(makeLoadData(), []);
		return (
			<DataGridLocalStoragePersist storageKey={PERSIST_STORAGE_KEY}>
				<DataGrid columns={COLUMNS_PERSIST} loadData={loadData} />
			</DataGridLocalStoragePersist>
		);
	},
	play: async ({ canvas, canvasElement }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();

		// the settings dialog lists every column with a visibility and a pin
		// checkbox, both carrying the field as their value
		const isVisible = (field: string) =>
			canvasElement.querySelector<HTMLInputElement>(
				`input[type="checkbox"][value="${field}"]`,
			)?.checked;

		// untouched by the stored state
		await expect(isVisible("name")).toBe(true);
		// the user hid this one
		await expect(isVisible("role")).toBe(false);
		// new to this user, so it follows its definition
		await expect(isVisible("internal_note")).toBe(false);
		// hidden by definition, but the stored state knows it and has it visible
		await expect(isVisible("active")).toBe(true);

		// what got written back is the current format, and it knows every column
		await waitFor(async () => {
			const stored = JSON.parse(
				localStorage.getItem(PERSIST_STORAGE_KEY) ?? "{}",
			) as { v?: number; shown?: string[]; hidden?: string[] };
			await expect(stored.v).toBe(2);
			await expect(stored.shown).toEqual(["name", "age", "active"]);
			await expect(stored.hidden).toEqual(["role", "internal_note"]);
		});
	},
};

const OVERRIDE_STORAGE_KEY = "cc-storybook-data-grid-override";
// what the link opening the grid sets: admins only, no column filters
const OVERRIDE_CUSTOM_DATA = { role: "admin" };
const OVERRIDE_FILTER: DataGridFilterSetting[] = [];

/**
 * Opened through a link which shows the admins (overrideCustomData) and clears
 * the column filters (overrideFilter). The user has saved users only, with a
 * name filter, and a plain visit still restores that: the grid persists what
 * was stored in place of the overrides, while the search and everything else
 * are persisted as usual. "Show query" reads what the grid shows from its ref.
 * Once the user resets the filters, they are persisted again.
 */
export const OverrideIsNotPersisted: Story = {
	beforeEach: () => {
		localStorage.setItem(
			OVERRIDE_STORAGE_KEY,
			JSON.stringify({
				v: 2,
				filter: { name: { type: "contains", value1: "a", value2: "" } },
				customData: { role: "user" },
			}),
		);
		return () => localStorage.removeItem(OVERRIDE_STORAGE_KEY);
	},
	render: () => {
		const gridRef = useRef<DataGridDispatch>(null);
		// eslint-disable-next-line react-hooks/exhaustive-deps
		const loadData = useCallback(makeLoadData(), []);
		const [query, setQuery] = useState("");
		const showQuery = useCallback(
			() => setQuery(JSON.stringify(gridRef.current?.getQuery())),
			[],
		);
		return (
			<Box
				sx={{
					height: "100%",
					display: "flex",
					flexDirection: "column",
					gap: 1,
				}}
			>
				<Button onClick={showQuery} variant={"contained"}>
					Show query
				</Button>
				<Box component={"pre"} data-testid={"query"} sx={{ m: 0 }}>
					{query}
				</Box>
				<Box sx={{ flexGrow: 1, minHeight: 0 }}>
					<DataGridLocalStoragePersist storageKey={OVERRIDE_STORAGE_KEY}>
						<DataGrid
							ref={gridRef}
							columns={COLUMNS}
							loadData={loadData}
							searchPlaceholder={"Search people"}
							overrideCustomData={OVERRIDE_CUSTOM_DATA}
							overrideFilter={OVERRIDE_FILTER}
						/>
					</DataGridLocalStoragePersist>
				</Box>
			</Box>
		);
	},
	play: async ({ canvas }) => {
		const stored = () =>
			JSON.parse(
				localStorage.getItem(OVERRIDE_STORAGE_KEY) ?? "{}",
			) as DataGridPersistentState;

		// the link's view: admins, no name filter
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		await expect(canvas.queryByText("Bob Smith")).not.toBeInTheDocument();
		await userEvent.click(canvas.getByRole("button", { name: "Show query" }));
		await expect(
			JSON.parse(canvas.getByTestId("query").textContent ?? "") as unknown,
		).toEqual({
			quickFilter: "",
			additionalFilters: { role: "admin" },
			fieldFilter: {},
			sort: [],
		});

		// the grid has written (widths are new), keeping the user's filters
		await waitFor(() => expect(stored().width).toBeDefined());
		await expect(stored().customData).toEqual({ role: "user" });
		await expect(stored().filter).toEqual({
			name: { type: "contains", value1: "a", value2: "" },
		});

		// no override touches the search, so it is the user's own
		await userEvent.type(canvas.getByPlaceholderText("Search people"), "e");
		await waitFor(() => expect(stored().search).toBe("e"));
		await expect(stored().customData).toEqual({ role: "user" });

		// after a reset the filters are the user's own again
		await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
		await userEvent.click(
			await within(document.body).findByRole("menuitem", {
				name: "Reset filter",
			}),
		);
		await waitFor(() => expect(stored().customData).toEqual({}));
		await expect(stored().filter).toBeUndefined();
		await expect(stored().search).toBeUndefined();
		await expect(await canvas.findByText("Bob Smith")).toBeVisible();
	},
};

const OVERRIDE_SEARCH_STORAGE_KEY = "cc-storybook-data-grid-override-search";
// what the link opening the grid sets: no search
const OVERRIDE_SEARCH = "";

/**
 * Opened through a link which clears the search (overrideSearch). The user
 * left "Bob" in the search box, and a plain visit still restores it: the grid
 * persists the stored search in place of the override, also while the user
 * searches for something else. Once the user resets the filters, the search is
 * persisted again.
 */
export const OverrideSearchIsNotPersisted: Story = {
	beforeEach: () => {
		localStorage.setItem(
			OVERRIDE_SEARCH_STORAGE_KEY,
			JSON.stringify({ v: 2, search: "Bob" }),
		);
		return () => localStorage.removeItem(OVERRIDE_SEARCH_STORAGE_KEY);
	},
	render: () => {
		// eslint-disable-next-line react-hooks/exhaustive-deps
		const loadData = useCallback(makeLoadData(), []);
		return (
			<DataGridLocalStoragePersist storageKey={OVERRIDE_SEARCH_STORAGE_KEY}>
				<DataGrid
					columns={COLUMNS}
					loadData={loadData}
					searchPlaceholder={"Search people"}
					overrideSearch={OVERRIDE_SEARCH}
				/>
			</DataGridLocalStoragePersist>
		);
	},
	play: async ({ canvas }) => {
		const stored = () =>
			JSON.parse(
				localStorage.getItem(OVERRIDE_SEARCH_STORAGE_KEY) ?? "{}",
			) as DataGridPersistentState;

		// the link's view: everyone, an empty search box
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		await expect(canvas.getByText("Bob Smith")).toBeVisible();
		const searchBox = canvas.getByPlaceholderText("Search people");
		await expect(searchBox).toHaveValue("");

		// the grid has written (widths are new), keeping the user's search
		await waitFor(() => expect(stored().width).toBeDefined());
		await expect(stored().search).toBe("Bob");

		// a search during the visit isn't persisted either
		await userEvent.type(searchBox, "Carol");
		await waitFor(() =>
			expect(canvas.queryByText("Alice Müller")).not.toBeInTheDocument(),
		);
		await expect(stored().search).toBe("Bob");

		// after a reset the search is the user's own again
		await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
		await userEvent.click(
			await within(document.body).findByRole("menuitem", {
				name: "Reset filter",
			}),
		);
		await waitFor(() => expect(stored().search).toBeUndefined());
		await userEvent.type(searchBox, "Dave");
		await waitFor(() => expect(stored().search).toBe("Dave"));
	},
};

/** A storage, like a server, which records what is written to it */
class RecordingStorage extends StorageProvider {
	data: Record<string, string> = {};
	writes: [key: string, value: string][] = [];
	getItem(key: string): Promise<string | null> {
		return Promise.resolve(this.data[key] ?? null);
	}
	setItem(key: string, value: string | null): void {
		if (value == null) {
			delete this.data[key];
			return;
		}
		this.data[key] = value;
		this.writes.push([key, value]);
	}
	clear(): void {
		this.data = {};
		this.writes = [];
	}
}
const newerFormatStorage = new RecordingStorage();
const NEWER_FORMAT_STORAGE_KEYS = { model: "people" };
/** The key StorageManager stores a bucket under */
const newerFormatBucket = (id: string) =>
	id + "-" + JSON.stringify(NEWER_FORMAT_STORAGE_KEYS);

/**
 * ISSUE-3496-ITEM-7: a newer library version (a tab of a later release, the
 * release before a rollback) stored this grid's state in its own format, in
 * both buckets of DataGridStorageManagerPersist, with the column widths in a
 * place this version doesn't know. This version reads what it can: "Role"
 * stays hidden and the search is "Bo". It fits the column widths to the grid,
 * but leaves the stored data as it is. Only a change, here typing in the
 * search, stores the grid's state, in this version's format.
 */
export const Issue3496Item7NewerFormatIsKeptUntilAChange: Story = {
	beforeEach: () => {
		newerFormatStorage.clear();
		const v = DATA_GRID_PERSIST_VERSION + 1;
		newerFormatStorage.data[
			newerFormatBucket(DATA_GRID_STORAGE_KEY_COLUMN_SIZING)
		] = JSON.stringify({ v, sizing: { name: 320, age: 80, active: 80 } });
		newerFormatStorage.data[newerFormatBucket(DATA_GRID_STORAGE_KEY_FILTERS)] =
			JSON.stringify({
				v,
				shown: ["name", "age", "active"],
				hidden: ["role"],
				search: "Bo",
			});
		StorageManager.configure((_id, keys) => [newerFormatStorage, keys]);
		return () => StorageManager.configure(DefaultGetStorageProviderCallback);
	},
	render: () => {
		// eslint-disable-next-line react-hooks/exhaustive-deps
		const loadData = useCallback(makeLoadData(), []);
		return (
			<DataGridStorageManagerPersist storageKeys={NEWER_FORMAT_STORAGE_KEYS}>
				<DataGrid
					columns={COLUMNS}
					loadData={loadData}
					searchPlaceholder={"Search people"}
				/>
			</DataGridStorageManagerPersist>
		);
	},
	play: async ({ canvas, canvasElement }) => {
		// what was written to a bucket, oldest first
		const writes = (id: string) =>
			newerFormatStorage.writes
				.filter(([key]) => key === newerFormatBucket(id))
				.map(([, value]) => JSON.parse(value) as DataGridPersistentState);
		const headerWidth = (field: string) =>
			canvasElement.querySelector<HTMLElement>(
				`[class~="column-header-${field}"]`,
			)?.parentElement?.style.width;

		// read what it can
		const searchBox = await canvas.findByPlaceholderText("Search people");
		await expect(searchBox).toHaveValue("Bo");
		await expect(await canvas.findByText("Bob Smith")).toBeVisible();
		await expect(canvas.queryByText("Alice Müller")).not.toBeInTheDocument();
		await expect(headerWidth("role")).toBeUndefined();
		// the widths are fitted: "Name" takes the room "Age" and "Active" leave
		await waitFor(() =>
			expect(parseFloat(headerWidth("name") ?? "0")).toBeGreaterThan(400),
		);

		await userEvent.type(searchBox, "b");
		await waitFor(() =>
			expect(writes(DATA_GRID_STORAGE_KEY_FILTERS)).not.toHaveLength(0),
		);
		// the first write is the change, not the fit
		await expect(writes(DATA_GRID_STORAGE_KEY_FILTERS)[0]).toMatchObject({
			v: DATA_GRID_PERSIST_VERSION,
			hidden: ["role"],
			search: "Bob",
		});
		// and the fitted widths go along with it
		const sizing = writes(DATA_GRID_STORAGE_KEY_COLUMN_SIZING)[0];
		await expect(sizing).toMatchObject({
			v: DATA_GRID_PERSIST_VERSION,
			initialResize: true,
		});
		await expect(sizing.width?.name).toBeGreaterThan(400);
		await expect(sizing).not.toHaveProperty("sizing");
	},
};

/** A storage that answers after a delay, like a server */
class DelayedStorage extends StorageProvider {
	data: Record<string, string> = {};
	getItem(key: string): Promise<string | null> {
		return new Promise((resolve) =>
			window.setTimeout(() => resolve(this.data[key] ?? null), 500),
		);
	}
	setItem(key: string, value: string | null): void {
		if (value == null) delete this.data[key];
		else this.data[key] = value;
	}
	clear(): void {
		this.data = {};
	}
}
const tenantStorage = new DelayedStorage();
const TENANTS = ["North", "South"];
/** The storage keys of a tenant's grid */
const tenantKeys = (tenant: string) => ({ model: "people", tenant });
/** The tenant shown, and how to show the next one */
const TenantContext = React.createContext<[string, () => void]>(["", () => {}]);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TenantFilterBar = (_props: IDataGridFilterBarProps) => {
	const [tenant, nextTenant] = useContext(TenantContext);
	return (
		<Button variant={"outlined"} onClick={nextTenant}>
			Tenant: {tenant}
		</Button>
	);
};

/**
 * ISSUE-3496-ITEM-15: the page keeps each tenant's grid state under its own
 * storage keys, and the grid's filter bar switches the tenant. Pressing
 * "Tenant: North" (Enter here) changes the storage keys: a Loader takes the grid's place
 * while the next tenant's state loads (half a second here), then the grid
 * opens with it (South's search is "Bo"). Keyboard focus stays on the way:
 * on the Loader while it loads, and then on the tenant button of the new
 * grid, so pressing it again switches back.
 */
export const Issue3496Item15StorageKeyChangeKeepsFocus: Story = {
	parameters: {
		a11y: {
			test: "error",
			config: {
				rules: [
					// the virtualized rows have no cells (ISSUE-3472-ITEM-11)
					{ id: "aria-required-children", enabled: false },
				],
			},
		},
	},
	beforeEach: () => {
		tenantStorage.clear();
		tenantStorage.data[
			DATA_GRID_STORAGE_KEY_FILTERS + "-" + JSON.stringify(tenantKeys("South"))
		] = JSON.stringify({ v: DATA_GRID_PERSIST_VERSION, search: "Bo" });
		StorageManager.configure((_id, keys) => [tenantStorage, keys]);
		return () => StorageManager.configure(DefaultGetStorageProviderCallback);
	},
	render: () => {
		const [tenant, setTenant] = useState(0);
		const nextTenant = useCallback(
			() => setTenant((prev) => (prev + 1) % TENANTS.length),
			[],
		);
		const name = TENANTS[tenant];
		const tenantCtx = React.useMemo(
			(): [string, () => void] => [name, nextTenant],
			[name, nextTenant],
		);
		const storageKeys = React.useMemo(() => tenantKeys(name), [name]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
		const loadData = useCallback(makeLoadData(), []);
		return (
			<TenantContext.Provider value={tenantCtx}>
				<DataGridStorageManagerPersist storageKeys={storageKeys}>
					<DataGrid
						columns={COLUMNS}
						loadData={loadData}
						searchPlaceholder={"Search people"}
						filterBar={TenantFilterBar}
					/>
				</DataGridStorageManagerPersist>
			</TenantContext.Provider>
		);
	},
	play: async ({ canvas }) => {
		const north = await canvas.findByRole(
			"button",
			{ name: "Tenant: North" },
			{ timeout: 3000 },
		);
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		north.focus();
		await expect(north).toHaveFocus();
		await userEvent.keyboard("{Enter}");

		// the Loader takes focus from the grid it replaces
		const progress = await canvas.findByRole("progressbar");
		await expect(north).not.toBeInTheDocument();
		await expect(progress.closest('[role="status"]')).toHaveFocus();

		// and hands it to the grid mounted for the new keys
		const south = await canvas.findByRole(
			"button",
			{ name: "Tenant: South" },
			{ timeout: 3000 },
		);
		await expect(south).toHaveFocus();
		await expect(canvas.getByPlaceholderText("Search people")).toHaveValue(
			"Bo",
		);
		await expect(await canvas.findByText("Bob Smith")).toBeVisible();

		// the keyboard switches back
		await userEvent.keyboard("{Enter}");
		await expect(
			await canvas.findByRole(
				"button",
				{ name: "Tenant: North" },
				{ timeout: 3000 },
			),
		).toHaveFocus();
	},
};

/** A storage like DelayedStorage, whose reads wait for release() while held */
class HeldStorage extends DelayedStorage {
	held = false;
	private waiting: (() => void)[] = [];
	getItem(key: string): Promise<string | null> {
		if (!this.held) return super.getItem(key);
		return new Promise((resolve) => {
			this.waiting.push(() => resolve(super.getItem(key)));
		});
	}
	release() {
		this.held = false;
		this.waiting.splice(0).forEach((answer) => answer());
	}
}
const pageStorage = new HeldStorage();

/**
 * ISSUE-3496-ITEM-16: a page whose title, note and tenant switch sit inside
 * DataGridStorageManagerPersist together with its grid, as in a CRUD page.
 * The storage answers like a server, and holds its first answer here until
 * the play function has looked at the page. The page shows at once: only the
 * grid waits for its stored state, with a Loader in its place. Switching the
 * tenant mounts the grid again for the new storage keys (South's search is
 * "Bo"), while the note keeps what was typed into it.
 */
export const Issue3496Item16OnlyTheGridWaits: Story = {
	parameters: {
		a11y: {
			test: "error",
			config: {
				rules: [
					// the virtualized rows have no cells (ISSUE-3472-ITEM-11)
					{ id: "aria-required-children", enabled: false },
				],
			},
		},
	},
	beforeEach: () => {
		pageStorage.clear();
		pageStorage.held = true;
		pageStorage.data[
			DATA_GRID_STORAGE_KEY_FILTERS + "-" + JSON.stringify(tenantKeys("South"))
		] = JSON.stringify({ v: DATA_GRID_PERSIST_VERSION, search: "Bo" });
		StorageManager.configure((_id, keys) => [pageStorage, keys]);
		return () => {
			pageStorage.release();
			StorageManager.configure(DefaultGetStorageProviderCallback);
		};
	},
	render: () => {
		const [tenant, setTenant] = useState(0);
		const nextTenant = useCallback(
			() => setTenant((prev) => (prev + 1) % TENANTS.length),
			[],
		);
		const name = TENANTS[tenant];
		const storageKeys = React.useMemo(() => tenantKeys(name), [name]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
		const loadData = useCallback(makeLoadData(), []);
		return (
			<DataGridStorageManagerPersist storageKeys={storageKeys}>
				<Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
					<Typography variant={"h6"} component={"h1"} sx={{ flexGrow: 1 }}>
						People
					</Typography>
					<TextField size={"small"} label={"Note"} />
					<Button variant={"outlined"} onClick={nextTenant}>
						Tenant: {name}
					</Button>
				</Box>
				<DataGrid
					columns={COLUMNS}
					loadData={loadData}
					searchPlaceholder={"Search people"}
				/>
			</DataGridStorageManagerPersist>
		);
	},
	play: async ({ canvas }) => {
		// the page shows while the stored state loads, a Loader stands in for
		// the grid
		await expect(canvas.getByRole("heading", { name: "People" })).toBeVisible();
		await expect(canvas.getByRole("progressbar")).toBeVisible();
		await expect(
			canvas.queryByPlaceholderText("Search people"),
		).not.toBeInTheDocument();
		const note = canvas.getByRole("textbox", { name: "Note" });
		await userEvent.type(note, "Call back");
		pageStorage.release();
		await expect(
			await canvas.findByText("Alice Müller", undefined, { timeout: 3000 }),
		).toBeVisible();

		// the grid is mounted again for South's keys, the note keeps its text
		await userEvent.click(
			canvas.getByRole("button", { name: "Tenant: North" }),
		);
		await waitFor(
			() => expect(canvas.queryByText("Alice Müller")).not.toBeInTheDocument(),
			{ timeout: 3000 },
		);
		await expect(
			await canvas.findByText("Bob Smith", undefined, { timeout: 3000 }),
		).toBeVisible();
		await expect(canvas.getByPlaceholderText("Search people")).toHaveValue(
			"Bo",
		);
		await expect(canvas.getByRole("textbox", { name: "Note" })).toBe(note);
		await expect(note).toHaveValue("Call back");
	},
};

/**
 * ISSUE-3492-ITEM-1: the parent holds the selection (shown above the grid). Tick Bob,
 * then search for "Smith": the selection stays Bob's, and the reload reports
 * no change to the parent.
 */
export const Issue3492Item1SearchKeepsControlledSelection: Story = {
	render: () => {
		const [selection, setSelection] = useState<[boolean, string[]]>([
			false,
			[],
		]);
		const onSelectionChange = useCallback(
			(invert: boolean, ids: string[]) => setSelection([invert, ids]),
			[],
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
		const loadData = useCallback(makeLoadData(), []);
		return (
			<Box
				sx={{
					height: "100%",
					display: "flex",
					flexDirection: "column",
					gap: 1,
				}}
			>
				<Box data-testid={"selection"}>{JSON.stringify(selection)}</Box>
				<Box sx={{ flexGrow: 1, minHeight: 0 }}>
					<DataGrid
						columns={COLUMNS}
						loadData={loadData}
						searchPlaceholder={"Search people"}
						selection={selection}
						onSelectionChange={onSelectionChange}
					/>
				</Box>
			</Box>
		);
	},
	play: async ({ canvas }) => {
		const selection = canvas.getByTestId("selection");
		await userEvent.click(await canvas.findByText("Bob Smith"));
		await waitFor(() => expect(selection).toHaveTextContent('[false,["2"]]'));
		await userEvent.type(canvas.getByPlaceholderText("Search people"), "Smith");
		// the reload has happened once the other people are gone
		await waitFor(
			() => expect(canvas.queryByText("Alice Müller")).not.toBeInTheDocument(),
			{ timeout: 3000 },
		);
		await expect(await canvas.findByText("Bob Smith")).toBeVisible();
		await expect(selection).toHaveTextContent('[false,["2"]]');
	},
};

/**
 * ISSUE-3493-ITEM-13: every row checkbox is named after its row ("Select Alice Müller"),
 * so a screen reader user can tell which row it selects. axe's label rule runs on
 * the row checkboxes as an error (the play only waits for them).
 */
export const Issue3493Item13RowCheckboxesAreNamed: Story = {
	args: {
		columns: COLUMNS,
		loadData: makeLoadData(),
		classes: { selectCheckbox: "story-row-checkbox" },
	},
	parameters: {
		a11y: {
			test: "error",
			context: { include: [".story-row-checkbox"] },
			options: { runOnly: { type: "rule", values: ["label"] } },
		},
	},
	play: async ({ canvas, canvasElement }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		await expect(
			canvasElement.querySelectorAll(".story-row-checkbox input"),
		).toHaveLength(PEOPLE.length);
	},
};

/**
 * ISSUE-3493-ITEM-17: search for "zzz", then press Enter on "Clear filters" in the
 * empty grid. The button goes with the filters it clears, so focus moves to the
 * (now empty) search field first, and stays there while the rows come back.
 */
export const Issue3493Item17ClearFiltersFocusesSearch: Story = {
	args: {
		columns: COLUMNS,
		loadData: makeLoadData(),
		searchPlaceholder: "Search people",
	},
	play: async ({ canvas }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		const search = canvas.getByPlaceholderText("Search people");
		await userEvent.type(search, "zzz");
		const clear = await canvas.findByRole(
			"button",
			{ name: "Clear filters" },
			{ timeout: 3000 },
		);
		clear.focus();
		await userEvent.keyboard("{Enter}");
		await expect(search).toHaveFocus();
		await expect(search).toHaveValue("");
		await expect(
			await canvas.findByText("Alice Müller", {}, { timeout: 3000 }),
		).toBeVisible();
		await expect(search).toHaveFocus();
	},
};

/**
 * The same on a phone, where the search box is a button that opens the field
 * in a popover: focus moves to that button
 */
export const Issue3493Item17ClearFiltersFocusesSearchOnPhone: Story = {
	args: {
		columns: COLUMNS,
		loadData: makeLoadData(),
	},
	globals: { viewport: { value: "mobile1", isRotated: false } },
	play: async ({ canvas, canvasElement }) => {
		await canvas.findByText("Alice Müller");
		const searchButton = canvas.getByRole("button", { name: "Search" });
		await userEvent.click(searchButton);
		// the popover's field is portaled out of the canvas and takes focus
		const field = await within(canvasElement.ownerDocument.body).findByRole(
			"textbox",
		);
		await waitFor(() => expect(field).toHaveFocus());
		await userEvent.keyboard("zzz");
		await userEvent.keyboard("{Escape}");
		const clear = await canvas.findByRole(
			"button",
			{ name: "Clear filters" },
			{ timeout: 3000 },
		);
		clear.focus();
		await userEvent.keyboard("{Enter}");
		await expect(searchButton).toHaveFocus();
		await canvas.findByText("Alice Müller", {}, { timeout: 3000 });
		await expect(searchButton).toHaveFocus();
	},
};
