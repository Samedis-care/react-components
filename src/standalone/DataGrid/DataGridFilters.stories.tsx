import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import {
	DataGrid,
	DataGridNoPersist,
	GridMultiSelectFilter,
	GridMultiSelectFilterBackend,
	GridSingleSelectFilter,
	GridSingleSelectFilterBackend,
} from "./index";
import type {
	DataGridData,
	DataGridProps,
	IDataGridColumnDef,
	IDataGridLoadDataParameters,
} from "./DataGrid";

// ─── Sample data ────────────────────────────────────────────────────────────
import React, { useMemo } from "react";
import type { IDataGridFilterBarProps } from "./Header/FilterBar";
import type { BaseSelectorData, MultiSelectorData } from "../Selector";
import { Framework } from "../../framework";
import createTestModel from "../../stories/test-utils/TestModel";

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

const STATUS_OPTIONS: BaseSelectorData[] = [
	{ value: "", label: "All" },
	{ value: "open", label: "Open" },
	{ value: "done", label: "Done" },
	{ value: "lost", label: "Lost" },
];

const KIND_OPTIONS: MultiSelectorData[] = [
	{ value: "alpha", label: "Alpha" },
	{ value: "beta", label: "Beta" },
	{ value: "gamma", label: "Gamma" },
];

/**
 * A filter bar with the two plain helpers for the custom data keys status and
 * kinds. It changes one key of the custom data at a time (the functional form
 * of setCustomData keeps the others).
 */
const StatusKindsBar = (props: IDataGridFilterBarProps) => {
	const { customData, setCustomData, inDialog } = props;
	return (
		<>
			<GridSingleSelectFilter
				label="Status"
				options={STATUS_OPTIONS}
				field="status"
				selected={customData.status as string | undefined}
				onSelect={(status) => setCustomData((prev) => ({ ...prev, status }))}
				dialog={inDialog}
			/>
			<GridMultiSelectFilter
				label="Kinds"
				options={KIND_OPTIONS}
				field="kinds"
				selected={customData.kinds as string[] | undefined}
				onSelect={(kinds) => setCustomData((prev) => ({ ...prev, kinds }))}
				dialog={inDialog}
			/>
		</>
	);
};

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

/** The bar's "Filter" button, which opens the filter panel */
const panelButtonOf = (root: HTMLElement) => {
	const button = root.querySelector<HTMLElement>(
		".components-care-data-grid-filter-bar .MuiButton-root",
	);
	if (!button) throw new Error("no filter panel button");
	return button;
};

/** The calls of a loadData spy */
const loadCalls = (loadData: unknown) =>
	(loadData as ReturnType<typeof fn>).mock.calls as [
		IDataGridLoadDataParameters,
	][];

const lastLoad = (loadData: unknown) => loadCalls(loadData).at(-1)?.[0];

/** Opens a bar select (BaseSelector) and picks an option */
const pickInBar = async (combobox: HTMLElement, option: string) => {
	await userEvent.click(combobox);
	const listbox = await within(document.body).findByRole("listbox");
	await userEvent.click(within(listbox).getByRole("option", { name: option }));
};

// ─── Filter bar and panel ────────────────────────────────────────────────────

/**
 * The filter bar with GridSingleSelectFilter ("Status") and
 * GridMultiSelectFilter ("Kinds") next to the search. Picking a value writes
 * the custom data, the grid reloads with it as additionalFilters, and the
 * changed filter is outlined (theme secondary colour).
 */
export const FilterBarHelpers: Story = {
	args: {
		columns: COLUMNS,
		loadData: fn(loadTasks),
		filterBar: StatusKindsBar,
	},
	play: async ({ args, canvas, canvasElement }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		const bar = canvasElement.querySelector<HTMLElement>(
			".components-care-data-grid-filter-bar",
		);
		if (!bar) throw new Error("no filter bar");
		const [status, kinds] = within(bar).getAllByRole("combobox");
		await expect(status).toHaveValue("All");
		await expect(
			bar.querySelector(".MuiAutocomplete-root.Mui-active"),
		).toBeNull();
		await pickInBar(status, "Open");
		await waitFor(
			() =>
				expect(lastLoad(args.loadData)?.additionalFilters).toEqual({
					status: "open",
				}),
			{ timeout: 3000 },
		);
		await waitFor(() => expect(canvas.queryByText("Bob Smith")).toBeNull());
		await expect(status).toHaveValue("Open");
		await expect(status.closest(".MuiAutocomplete-root")).toHaveClass(
			"Mui-active",
		);
		await pickInBar(kinds, "Beta");
		await waitFor(
			() =>
				expect(lastLoad(args.loadData)?.additionalFilters).toEqual({
					status: "open",
					kinds: ["beta"],
				}),
			{ timeout: 3000 },
		);
		await expect(await canvas.findByText("Carol Jones")).toBeVisible();
		await expect(canvas.queryByText("Alice Müller")).toBeNull();
	},
};

/**
 * Narrower than enableFilterDialogWidth, the bar is a "Filter" button. It
 * opens the panel over the rows, where the helpers render as a radio list
 * and a checkbox list. A pick applies at once; "Close" hides the panel, and
 * the button's icon marks the changed custom filters.
 */
export const FilterPanelHelpers: Story = {
	args: {
		columns: COLUMNS,
		loadData: fn(loadTasks),
		filterBar: StatusKindsBar,
		enableFilterDialogWidth: 100000,
		// the settings panel shares this slot; it is hidden and has no violations
		classes: { contentOverlayPaper: "story-filter-panel" },
	},
	parameters: {
		a11y: {
			test: "error",
			// the grid behind the panel has violations of its own
			context: { include: [".story-filter-panel"] },
		},
	},
	play: async ({ args, canvas, canvasElement }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		// the bar is not shown; the button is
		await expect(canvasElement.querySelector("[role=combobox]")).toBeNull();
		const button = panelButtonOf(canvasElement);
		await expect(button).toHaveTextContent("Filter");
		const icon = button.querySelector("svg");
		await expect(icon).not.toHaveClass("CcDataGrid-customFilterActiveIcon");
		await userEvent.click(button);
		const panel = await waitFor(() => {
			const element = Array.from(
				canvasElement.querySelectorAll<HTMLElement>(".story-filter-panel"),
			).find((paper) => paper.textContent.includes("Filter selection"));
			if (!element) throw new Error("the panel is not open");
			return element;
		});
		await expect(
			within(panel).getByRole("heading", { name: "Filter selection" }),
		).toBeVisible();
		await userEvent.click(within(panel).getByRole("radio", { name: "Open" }));
		await userEvent.click(
			within(panel).getByRole("checkbox", { name: "Beta" }),
		);
		await expect(
			within(panel).getByRole("radio", { name: "Open" }),
		).toBeChecked();
		await waitFor(
			() =>
				expect(lastLoad(args.loadData)?.additionalFilters).toEqual({
					status: "open",
					kinds: ["beta"],
				}),
			{ timeout: 3000 },
		);
		await userEvent.click(within(panel).getByRole("button", { name: "Close" }));
		await waitFor(() => expect(panel).not.toBeVisible());
		await expect(await canvas.findByText("Carol Jones")).toBeVisible();
		await expect(button).toBeVisible();
		await expect(button.querySelector("svg")).toHaveClass(
			"CcDataGrid-customFilterActiveIcon",
		);
		// reopened, the panel shows the same selection
		await userEvent.click(button);
		await waitFor(() => expect(panel).toBeVisible());
		await expect(
			within(panel).getByRole("radio", { name: "Open" }),
		).toBeChecked();
		await expect(
			within(panel).getByRole("checkbox", { name: "Beta" }),
		).toBeChecked();
	},
};

const OWNER_TO_DATA = (data: Record<string, unknown>): BaseSelectorData => ({
	value: data.id as string,
	label: `${data.first_name as string} ${data.last_name as string}`,
});

const TEAM_TO_DATA = (data: Record<string, unknown>): MultiSelectorData => ({
	value: data.id as string,
	label: data.department as string,
});

const BackendBarHost = (props: Partial<DataGridProps>) => {
	const model = useMemo(createTestModel, []);
	const Bar = useMemo(
		() =>
			function BackendBar(barProps: IDataGridFilterBarProps) {
				const { customData, setCustomData, inDialog } = barProps;
				return (
					<>
						<GridSingleSelectFilterBackend
							label="Owner"
							model={model}
							modelToSelectorData={OWNER_TO_DATA}
							selected={(customData.owner as string | undefined) ?? null}
							onSelect={(owner) =>
								setCustomData((prev) => ({ ...prev, owner }))
							}
							dialog={inDialog}
						/>
						<GridMultiSelectFilterBackend
							label="Teams"
							model={model}
							modelToSelectorData={TEAM_TO_DATA}
							selected={(customData.teams as string[] | undefined) ?? []}
							onSelect={(teams) =>
								setCustomData((prev) => ({ ...prev, teams }))
							}
							dialog={inDialog}
						/>
					</>
				);
			},
		[model],
	);
	return (
		<Framework>
			<Box sx={{ height: 500 }}>
				<DataGridNoPersist>
					<DataGrid
						columns={COLUMNS}
						loadData={loadTasks}
						filterBar={Bar}
						{...props}
					/>
				</DataGridNoPersist>
			</Box>
		</Framework>
	);
};

/**
 * GridSingleSelectFilterBackend ("Owner") and GridMultiSelectFilterBackend
 * ("Teams") load their options through a model. Picking an owner writes its
 * id into the custom data and outlines the filter.
 */
export const BackendFilterBarHelpers: Story = {
	args: { loadData: fn(loadTasks) },
	render: (args) => <BackendBarHost loadData={args.loadData} />,
	play: async ({ args, canvas, canvasElement }) => {
		await expect(await canvas.findByText("Alice Müller")).toBeVisible();
		const bar = canvasElement.querySelector<HTMLElement>(
			".components-care-data-grid-filter-bar",
		);
		if (!bar) throw new Error("no filter bar");
		const [owner] = within(bar).getAllByRole("combobox");
		await userEvent.click(owner);
		const listbox = await within(document.body).findByRole("listbox");
		await userEvent.click(
			await within(listbox).findByRole("option", { name: "Bob Smith" }),
		);
		await waitFor(
			() =>
				expect(lastLoad(args.loadData)?.additionalFilters).toEqual({
					owner: "2",
				}),
			{ timeout: 3000 },
		);
		await expect(owner.closest(".MuiAutocomplete-root")).toHaveClass(
			"Mui-active",
		);
	},
};

// ─── Defaults from defaultCustomData ─────────────────────────────────────────

const STATUS_KINDS_DEFAULTS = { status: "open", kinds: ["beta"] };

/**
 * The helpers take their default from the grid's defaultCustomData, here
 * `{ status: "open", kinds: ["beta"] }`: at the default neither is outlined.
 * Picking "All" outlines the status filter, because it differs from the
 * default, and "Reset filter" restores the default, which removes the outline.
 */
export const Issue3494Item4HelpersFollowDefaultCustomData: Story = {
	args: {
		columns: COLUMNS,
		loadData: fn(loadTasks),
		filterBar: StatusKindsBar,
		defaultCustomData: STATUS_KINDS_DEFAULTS,
	},
	play: async ({ args, canvas, canvasElement }) => {
		await expect(await canvas.findByText("Carol Jones")).toBeVisible();
		await expect(canvas.queryByText("Bob Smith")).toBeNull();
		const bar = canvasElement.querySelector<HTMLElement>(
			".components-care-data-grid-filter-bar",
		);
		if (!bar) throw new Error("no filter bar");
		const [status, kinds] = within(bar).getAllByRole("combobox");
		await expect(status).toHaveValue("Open");
		// the multi-select lists its selection in the input
		await expect((kinds as HTMLInputElement).value.trim()).toBe("Beta");
		await expect(
			bar.querySelector(".MuiAutocomplete-root.Mui-active"),
		).toBeNull();
		await pickInBar(status, "All");
		await waitFor(
			() =>
				expect(lastLoad(args.loadData)?.additionalFilters).toEqual({
					status: "",
					kinds: ["beta"],
				}),
			{ timeout: 3000 },
		);
		await expect(await canvas.findByText("Bob Smith")).toBeVisible();
		await expect(status.closest(".MuiAutocomplete-root")).toHaveClass(
			"Mui-active",
		);
		await expect(kinds.closest(".MuiAutocomplete-root")).not.toHaveClass(
			"Mui-active",
		);
		await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
		await userEvent.click(
			await within(document.body).findByRole("menuitem", {
				name: "Reset filter",
			}),
		);
		await waitFor(() => expect(status).toHaveValue("Open"));
		await expect(
			bar.querySelector(".MuiAutocomplete-root.Mui-active"),
		).toBeNull();
		await waitFor(
			() =>
				expect(lastLoad(args.loadData)?.additionalFilters).toEqual(
					STATUS_KINDS_DEFAULTS,
				),
			{ timeout: 3000 },
		);
		// the rows of the default filter (not those of a reload in between)
		await waitFor(async () => {
			await expect(canvas.getByText("Carol Jones")).toBeVisible();
			await expect(canvas.queryByText("Bob Smith")).toBeNull();
		});
	},
};
