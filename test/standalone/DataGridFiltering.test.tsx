import React, { useState } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import ccI18n from "../../src/i18n";
import FilterEntry, {
	type IFilterDef,
} from "../../src/standalone/DataGrid/Content/FilterEntry";
import DataGrid, {
	DataGridPropsContext,
	type DataGridData,
	type DataGridProps,
	type DataGridSetFilterData,
	type IDataGridColumnDef,
	type IDataGridState,
	useDataGridState,
} from "../../src/standalone/DataGrid/DataGrid";
import type { ModelFilterType } from "../../src/backend-integration/Model";
import type { IDataGridFilterBarProps } from "../../src/standalone/DataGrid/Header/FilterBar";
import userEvent from "@testing-library/user-event";
import GridSingleSelectFilter from "../../src/standalone/DataGrid/GridSingleSelectFilter";
import {
	areDataGridCustomFiltersActive,
	isDataGridCustomFilterActive,
} from "../../src/standalone/DataGrid";
import GridMultiSelectFilter from "../../src/standalone/DataGrid/GridMultiSelectFilter";
import GridMultiSelectFilterBackend from "../../src/standalone/DataGrid/GridMultiSelectFilterBackend";

// The grid body (MultiGrid) reports its rendered rows into the state; without
// it the tests own the grid state, and only the header, filter bar and panel
// render (they are this file's subject)
vi.mock("../../src/standalone/Virtualized/MultiGrid", () => ({
	default: () => null,
}));

// The backend selectors load through a model and react-query; the filters only
// pass props to them, so they are replaced by recorders of those props
const idSelectorProps: { current: Record<string, unknown> | null } = {
	current: null,
};

vi.mock("../../src/backend-components/Selector/BackendMultiSelect", () => ({
	default: (p: Record<string, unknown>) => {
		idSelectorProps.current = p;
		return <div data-testid="backend-multi-select" />;
	},
}));

const multipleProps: { current: Record<string, unknown> | null } = {
	current: null,
};

vi.mock("../../src/backend-components/Selector/BackendMultipleSelect", () => ({
	default: (p: Record<string, unknown>) => {
		multipleProps.current = p;
		return (
			<div
				data-testid="backend-multiple-select"
				className={p.className as string}
			/>
		);
	},
}));

vi.mock("../../src/utils/isTouchDevice", () => ({ default: () => false }));

// ResizeObserver whose callbacks a test can fire
const observers: Array<() => void> = [];

beforeAll(async () => {
	await ccI18n.init();
	await ccI18n.changeLanguage("en");
	if (!("matchMedia" in window)) {
		Object.defineProperty(window, "matchMedia", {
			configurable: true,
			value: (query: string) =>
				({
					matches: false,
					media: query,
					onchange: null,
					addListener: () => {},
					removeListener: () => {},
					addEventListener: () => {},
					removeEventListener: () => {},
					dispatchEvent: () => false,
				}) as MediaQueryList,
		});
	}
	window.ResizeObserver = class {
		cb: () => void;
		constructor(cb: () => void) {
			this.cb = cb;
		}
		observe() {
			observers.push(this.cb);
		}
		unobserve() {}
		disconnect() {
			const i = observers.indexOf(this.cb);
			if (i >= 0) observers.splice(i, 1);
		}
	} as never;
});

afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.restoreAllMocks();
	idSelectorProps.current = null;
	multipleProps.current = null;
	observers.length = 0;
});

const theme = createTheme();

// --- Grid*Filter harness ---------------------------------------------------
// the filters inside the grid's props context
const Ctx = (p: {
	children: React.ReactNode;
	classes?: DataGridProps["classes"];
	theme?: ReturnType<typeof createTheme>;
}) => (
	<ThemeProvider theme={p.theme ?? theme}>
		<DataGridPropsContext.Provider
			value={{ classes: p.classes } as DataGridProps}
		>
			{p.children}
		</DataGridPropsContext.Provider>
	</ThemeProvider>
);

const OPTIONS = [
	{ value: "", label: "All" },
	{ value: "a", label: "A" },
	{ value: "b", label: "B" },
];

/** a panel filter whose selection follows onSelect, as the grid's custom data does */
const PanelSingle = (p: {
	initial: string;
	onSelect: (value: string) => void;
	label?: string;
	field?: string;
}) => {
	const [selected, setSelected] = useState(p.initial);
	const { onSelect } = p;
	const handleSelect = React.useCallback(
		(value: string) => {
			onSelect(value);
			setSelected(value);
		},
		[onSelect],
	);
	return (
		<GridSingleSelectFilter
			label={p.label ?? "Status"}
			options={OPTIONS}
			selected={selected}
			field={p.field ?? "status"}
			onSelect={handleSelect}
			dialog
		/>
	);
};

describe("GridSingleSelectFilter", () => {
	it("[ISSUE-3494-ITEM-20] dialog: the radios form one radio group (one shared name), so the arrow keys move between them", () => {
		render(
			<Ctx>
				<GridSingleSelectFilter
					label="Status"
					options={OPTIONS}
					selected=""
					field="status"
					onSelect={vi.fn()}
					dialog
				/>
			</Ctx>,
		);
		const names = screen
			.getAllByRole<HTMLInputElement>("radio")
			.map((r) => r.name);
		expect(new Set(names).size, `radio names ${JSON.stringify(names)}`).toBe(1);
	});
	it("[ISSUE-3494-ITEM-20] dialog: Tab reaches the checked radio, the arrow keys move the selection, and the next Tab leaves the group", async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		render(
			<Ctx>
				<PanelSingle initial="a" onSelect={onSelect} />
				<button>after</button>
			</Ctx>,
		);
		await user.tab();
		expect(screen.getByRole("radio", { name: "A" })).toHaveFocus();
		await user.keyboard("{ArrowDown}");
		expect(onSelect).toHaveBeenLastCalledWith("b");
		expect(screen.getByRole("radio", { name: "B" })).toBeChecked();
		expect(screen.getByRole("radio", { name: "B" })).toHaveFocus();
		await user.keyboard("{ArrowUp}");
		expect(onSelect).toHaveBeenLastCalledWith("a");
		await user.tab();
		expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
	});
	it("[ISSUE-3494-ITEM-20] dialog: two filters in the panel are two groups, so the arrow keys stay within one", async () => {
		const user = userEvent.setup();
		const first = vi.fn();
		const second = vi.fn();
		render(
			<Ctx>
				<PanelSingle initial="b" onSelect={first} label="Status" />
				<PanelSingle initial="" onSelect={second} label="Kind" field="kind" />
			</Ctx>,
		);
		const radios = screen.getAllByRole<HTMLInputElement>("radio");
		expect(new Set(radios.map((r) => r.name)).size).toBe(2);
		await user.tab();
		expect(radios[2]).toHaveFocus();
		// the last option of the first filter wraps to its own first option
		await user.keyboard("{ArrowDown}");
		expect(first).toHaveBeenLastCalledWith("");
		expect(radios[0]).toHaveFocus();
		expect(second).not.toHaveBeenCalled();
		await user.tab();
		expect(radios[3]).toHaveFocus();
	});
});

// --- FilterEntry harness ---------------------------------------------------
// FilterEntry alone, with a parent that feeds onChange back into value, as
// the column header does
let last: IFilterDef | undefined;

const close = vi.fn();

const Entry = (p: {
	valueType: ModelFilterType;
	valueData?: IDataGridColumnDef["filterData"];
	initial?: IFilterDef;
	gridProps?: Partial<DataGridProps>;
}) => {
	const [value, setValue] = useState<IFilterDef | undefined>(p.initial);
	const onChange = React.useCallback((def: IFilterDef) => {
		last = def;
		setValue(def);
	}, []);
	return (
		<ThemeProvider theme={theme}>
			<LocalizationProvider dateAdapter={AdapterMoment}>
				<DataGridPropsContext.Provider
					value={(p.gridProps ?? {}) as DataGridProps}
				>
					<FilterEntry
						field="f"
						valueType={p.valueType}
						valueData={p.valueData}
						value={value}
						onChange={onChange}
						close={close}
						depth={1}
					/>
				</DataGridPropsContext.Provider>
			</LocalizationProvider>
		</ThemeProvider>
	);
};

const renderEntry = (p: Parameters<typeof Entry>[0]) => {
	last = undefined;
	close.mockClear();
	return render(<Entry {...p} />);
};

const box = (v: string) =>
	document.querySelector<HTMLInputElement>(
		`input[type=checkbox][value="${v}"]`,
	)!;

const MAGIC = "__MAGIC_EMPTY__";

const ENUM3: DataGridSetFilterData = [
	{ value: "", getLabelText: () => "None" },
	{ value: "a", getLabelText: () => "A" },
	{ value: "b", getLabelText: () => "B" },
];

/** more than 5 entries: the list gets "Select all" */
const ENUM6: DataGridSetFilterData = [
	...ENUM3,
	{ value: "c", getLabelText: () => "C" },
	{ value: "d", getLabelText: () => "D" },
	{ value: "e", getLabelText: () => "E" },
];

describe("FilterEntry: enum", () => {
	it("[ISSUE-3494-ITEM-16] every checkbox of the list is named by its text", () => {
		renderEntry({ valueType: "enum", valueData: ENUM6 });
		expect(screen.getByRole("checkbox", { name: "A" })).toBe(box("a"));
		expect(screen.getByRole("checkbox", { name: "None" })).toBe(box(MAGIC));
		expect(
			screen.getByRole("checkbox", { name: "Select all" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("checkbox", { name: "Show all except…" }),
		).toBeInTheDocument();
	});
	it("[ISSUE-3494-ITEM-16] clicking a value's text ticks it", () => {
		renderEntry({ valueType: "enum", valueData: ENUM3 });
		fireEvent.click(screen.getByText("A"));
		expect(last).toMatchObject({ type: "inSet", value1: "a" });
	});
	it("[ISSUE-3494-ITEM-16] clicking the text of Select all and Show all except… toggles them", () => {
		renderEntry({ valueType: "enum", valueData: ENUM6 });
		fireEvent.click(screen.getByText("Select all"));
		expect(last).toMatchObject({
			type: "inSet",
			value1: `${MAGIC},a,b,c,d,e`,
		});
		fireEvent.click(screen.getByText("Show all except…"));
		expect(last).toMatchObject({ type: "notInSet" });
		expect(
			screen.getByRole("checkbox", { name: "Show all except…" }),
		).toBeChecked();
	});
	it("[ISSUE-3494-ITEM-16] clicking the text of a disabled value does not tick it", () => {
		renderEntry({
			valueType: "enum",
			valueData: [
				{ value: "a", getLabelText: () => "A" },
				{ value: "b", getLabelText: () => "B", disabled: true },
			],
		});
		fireEvent.click(screen.getByText("B"));
		expect(last).toBeUndefined();
		expect(screen.getByRole("checkbox", { name: "B" })).toBeDisabled();
	});
	it('[ISSUE-3494-ITEM-16] the checkboxes are a group named "Values"', () => {
		renderEntry({ valueType: "enum", valueData: ENUM6 });
		const group = screen.getByRole("group", { name: "Values" });
		expect(
			within(group).getByRole("checkbox", { name: "Select all" }),
		).toBeInTheDocument();
		expect(within(group).getByRole("checkbox", { name: "E" })).toBe(box("e"));
	});
	it("[ISSUE-3494-ITEM-16] Select all is mixed while only some values are ticked", () => {
		renderEntry({ valueType: "enum", valueData: ENUM6 });
		const all = () => screen.getByRole("checkbox", { name: "Select all" });
		expect(all()).not.toBeChecked();
		expect(all()).not.toBePartiallyChecked();
		fireEvent.click(box("a"));
		expect(all()).toBePartiallyChecked();
		expect(all()).not.toBeChecked();
		// a mixed Select all ticks every value
		fireEvent.click(all());
		expect(last).toMatchObject({
			type: "inSet",
			value1: `${MAGIC},a,b,c,d,e`,
		});
		expect(all()).toBeChecked();
		expect(all()).not.toBePartiallyChecked();
		fireEvent.click(box("c"));
		expect(all()).toBePartiallyChecked();
	});
	it("[ISSUE-3494-ITEM-16] Select all is not mixed for a stored value the list does not offer", () => {
		renderEntry({
			valueType: "enum",
			valueData: ENUM6,
			initial: { type: "inSet", value1: "gone", value2: "" },
		});
		const all = screen.getByRole("checkbox", { name: "Select all" });
		expect(all).not.toBeChecked();
		expect(all).not.toBePartiallyChecked();
	});
});

type CustomProps = {
	filter: unknown;
	setFilter: (v: unknown) => void;
	close: () => void;
};

describe("FilterEntry: custom", () => {
	it("[ISSUE-3494-ITEM-1] a stored value that is not JSON opens without throwing", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const Comp = () => <div>custom ui</div>;
		expect(() =>
			renderEntry({
				valueType: "custom",
				valueData: { filterComponent: Comp as never },
				initial: { type: "equals", value1: "plain", value2: "" },
			}),
		).not.toThrow();
		expect(screen.getByText("custom ui")).toBeInTheDocument();
	});
	it("[ISSUE-3494-ITEM-1] a stored value that is not JSON reaches the component as no filter, and setFilter replaces it", () => {
		const seen: unknown[] = [];
		let setF: (v: unknown) => void = () => {};
		const Comp = (p: CustomProps) => {
			seen.push(p.filter);
			setF = p.setFilter;
			return null;
		};
		renderEntry({
			valueType: "custom",
			valueData: { filterComponent: Comp as never },
			initial: { type: "equals", value1: "{not json", value2: "" },
		});
		expect(seen).toEqual([undefined]);
		// opening the filter leaves the stored value alone
		expect(last).toBeUndefined();
		act(() => setF({ a: 1 }));
		expect(last).toEqual({ type: "equals", value1: '{"a":1}', value2: "" });
		expect(seen.at(-1)).toEqual({ a: 1 });
	});
});

describe("FilterEntry: AND/OR", () => {
	const chained: IFilterDef = {
		type: "contains",
		value1: "x",
		value2: "",
		nextFilterType: "and",
		nextFilter: { type: "contains", value1: "y", value2: "" },
	};
	it("[ISSUE-3494-ITEM-19] clicking the word AND while AND is chosen keeps AND", () => {
		renderEntry({ valueType: "string", initial: chained });
		fireEvent.click(screen.getAllByText("AND")[0]);
		expect(last?.nextFilterType ?? "and").toBe("and");
	});
	it('[ISSUE-3494-ITEM-19] the choice of OR is named "OR", not "AND OR"', () => {
		renderEntry({ valueType: "string", initial: chained });
		const named = (name: string) => [
			...screen.queryAllByRole("switch", { name }),
			...screen.queryAllByRole("radio", { name }),
			...screen.queryAllByRole("button", { name }),
		];
		expect(named("OR")).not.toHaveLength(0);
		expect(named("AND OR")).toHaveLength(0);
	});
	/** the AND/OR buttons of the (only) combinator */
	const combinator = () => {
		const group = screen.getByRole("group", { name: "Combine conditions" });
		return {
			group,
			and: within(group).getByRole("button", { name: "AND" }),
			or: within(group).getByRole("button", { name: "OR" }),
		};
	};
	const single: IFilterDef = { ...chained, nextFilter: undefined };
	it('[ISSUE-3494-ITEM-19] AND and OR are the two toggle buttons of a group named "Combine conditions", the chosen one pressed', () => {
		renderEntry({
			valueType: "string",
			initial: { ...single, nextFilterType: "or" },
		});
		const { group, and, or } = combinator();
		expect(within(group).getAllByRole("button")).toEqual([and, or]);
		expect(and).toHaveAttribute("aria-pressed", "false");
		expect(or).toHaveAttribute("aria-pressed", "true");
	});
	it("[ISSUE-3494-ITEM-19] a click on a word picks that word, a click on the picked word keeps it, and only nextFilterType changes", () => {
		renderEntry({ valueType: "string", initial: chained });
		fireEvent.click(screen.getAllByText("OR")[0]);
		expect(last).toEqual({ ...chained, nextFilterType: "or" });
		last = undefined;
		fireEvent.click(screen.getAllByText("OR")[0]);
		expect(last).toBeUndefined();
		expect(screen.getAllByRole("button", { name: "OR" })[0]).toHaveAttribute(
			"aria-pressed",
			"true",
		);
		fireEvent.click(screen.getAllByText("AND")[0]);
		expect(last).toEqual({ ...chained, nextFilterType: "and" });
	});
	it("[ISSUE-3494-ITEM-19] a filter without nextFilterType shows AND as chosen", () => {
		renderEntry({
			valueType: "string",
			initial: { type: "contains", value1: "x", value2: "" },
		});
		const { and, or } = combinator();
		expect(and).toHaveAttribute("aria-pressed", "true");
		expect(or).toHaveAttribute("aria-pressed", "false");
	});
	it("[ISSUE-3494-ITEM-19] the group is one Tab stop: the arrow keys move the focus, Space or Enter picks the focused word", async () => {
		const user = userEvent.setup();
		renderEntry({ valueType: "string", initial: single });
		const { and, or } = combinator();
		// the first condition's value field
		await user.click(screen.getAllByRole("textbox")[0]);
		await user.tab();
		expect(and).toHaveFocus();
		await user.keyboard("{ArrowRight}");
		expect(or).toHaveFocus();
		// moving the focus picks nothing
		expect(last).toBeUndefined();
		await user.keyboard(" ");
		expect(last).toEqual({ ...single, nextFilterType: "or" });
		expect(or).toHaveAttribute("aria-pressed", "true");
		expect(or).toHaveFocus();
		await user.keyboard("{ArrowLeft}");
		expect(and).toHaveFocus();
		await user.keyboard("{Enter}");
		expect(last).toEqual({ ...single, nextFilterType: "and" });
		expect(and).toHaveAttribute("aria-pressed", "true");
		// the next Tab leaves the group, to the next condition
		await user.tab();
		expect(screen.getAllByRole("combobox")[1]).toHaveFocus();
	});
});

const flush = async () => {
	for (let i = 0; i < 10; i++) await act(() => Promise.resolve());
};

// --- FilterBar / panel / button in the real grid ---------------------------
let gridState: IDataGridState | null = null;

const Bar = (p: IDataGridFilterBarProps) => {
	const [state] = useDataGridState();
	gridState = state;
	return (
		<GridSingleSelectFilter
			label="Status"
			options={OPTIONS}
			field="status"
			selected={p.customData.status as string | undefined}
			onSelect={(v) => p.setCustomData((o) => ({ ...o, status: v }))}
			dialog={p.inDialog}
		/>
	);
};

const ok = (): DataGridData => ({
	rowsTotal: 1,
	rows: [{ id: "1", name: "x" }],
});

const COLS: IDataGridColumnDef[] = [
	{ field: "name", headerName: "Name", type: "string" },
];

const Grid = (p: Partial<DataGridProps>) => (
	<ThemeProvider theme={theme}>
		<DataGrid
			columns={COLS}
			loadData={ok}
			filterBar={Bar}
			classes={{ header: "my-header" }}
			{...p}
		/>
	</ThemeProvider>
);

/** the grid hides its header while the filter panel is open */
const panelOpen = () =>
	getComputedStyle(document.querySelector(".my-header")!).display === "none";

const FILTER_BUTTON = ".components-care-data-grid-filter-bar .MuiButton-root";

/** the panel's "Filter" button (in bar mode the bar shows the filters instead) */
const filterButton = () =>
	waitFor(() => {
		const button = document.querySelector<HTMLElement>(FILTER_BUTTON);
		if (!button) throw new Error("no filter button");
		return button;
	});

/** an app's own control in the bar, not one of the Grid*Filter helpers */
const AppControlBar = (p: IDataGridFilterBarProps) => (
	<div>
		<button
			type="button"
			onClick={() => p.setCustomData((o) => ({ ...o, archive: true }))}
		>
			Show archived
		</button>
	</div>
);

/** a Backend helper, which counts itself active while it has any selection */
const TeamsBar = (p: IDataGridFilterBarProps) => (
	<GridMultiSelectFilterBackend
		model={{} as never}
		modelToSelectorData={(() => ({})) as never}
		label="Teams"
		selected={p.customData.teams as string[]}
		onSelect={(v) => p.setCustomData((o) => ({ ...o, teams: v }))}
		dialog={p.inDialog}
	/>
);

const ACTIVE_ICON = "CcDataGrid-customFilterActiveIcon";

/** a plain multi-select helper for the custom data key "kinds" */
const KindsBar = (p: IDataGridFilterBarProps) => (
	<GridMultiSelectFilter
		label="Kinds"
		options={OPTIONS.slice(1)}
		field="kinds"
		selected={p.customData.kinds as string[] | undefined}
		onSelect={(v) => p.setCustomData((o) => ({ ...o, kinds: v }))}
		dialog={p.inDialog}
	/>
);

/** the bar's filter selectors (their MUI Autocomplete roots), in order */
const barSelectors = () =>
	Array.from(
		document.querySelectorAll<HTMLElement>(
			".components-care-data-grid-filter-bar .MuiAutocomplete-root",
		),
	);

/** the class the helpers put on a bar selector while it is highlighted */
const OUTLINED = "Mui-active";

describe("FilterBar, CustomFiltersButton, CustomFilterDialog", () => {
	it("[ISSUE-3494-ITEM-4] dialog mode: an active custom filter marks the Filter button before the panel was ever opened", async () => {
		render(
			<Grid
				enableFilterDialogWidth={500}
				overrideCustomData={{ status: "a" }}
			/>,
		);
		const button = await filterButton();
		await flush();
		expect(button.querySelector("svg")).toHaveClass(
			"CcDataGrid-customFilterActiveIcon",
		);
	});
	it("[ISSUE-3494-ITEM-4] dialog mode: custom data at its defaultCustomData does not mark the Filter button, also with the panel's helper mounted", async () => {
		render(
			<Grid
				enableFilterDialogWidth={500}
				defaultCustomData={{ status: "a" }}
			/>,
		);
		const button = await filterButton();
		const icon = () => button.querySelector("svg")!;
		await flush();
		expect(icon()).not.toHaveClass(ACTIVE_ICON);
		// with the panel's helper mounted
		fireEvent.click(button);
		expect(screen.getByRole("radio", { name: "A" })).toBeChecked();
		fireEvent.click(screen.getByRole("button", { name: "Close" }));
		await flush();
		expect(icon()).not.toHaveClass(ACTIVE_ICON);
		expect(gridState!.customData).toEqual({ status: "a" });
	});
	it("[ISSUE-3494-ITEM-4] dialog mode: without defaultCustomData, picking the helper's empty default again unmarks the Filter button", async () => {
		render(<Grid enableFilterDialogWidth={500} />);
		const button = await filterButton();
		const icon = () => button.querySelector("svg")!;
		const pickInPanel = async (label: string) => {
			fireEvent.click(button);
			fireEvent.click(screen.getByRole("radio", { name: label }));
			fireEvent.click(screen.getByRole("button", { name: "Close" }));
			await flush();
		};
		await pickInPanel("A");
		expect(icon()).toHaveClass(ACTIVE_ICON);
		await pickInPanel("All");
		// customData is { status: "" } now, which equals the default {}
		expect(gridState!.customData).toEqual({ status: "" });
		expect(icon()).not.toHaveClass(ACTIVE_ICON);
	});
	it("[ISSUE-3494-ITEM-4] dialog mode: an app's own control in the bar marks the Filter button", async () => {
		render(<Grid filterBar={AppControlBar} enableFilterDialogWidth={500} />);
		const button = await filterButton();
		const icon = () => button.querySelector("svg")!;
		expect(icon()).not.toHaveClass(ACTIVE_ICON);
		fireEvent.click(button);
		expect(panelOpen()).toBe(true);
		fireEvent.click(screen.getByRole("button", { name: "Show archived" }));
		fireEvent.click(screen.getByRole("button", { name: "Close" }));
		expect(panelOpen()).toBe(false);
		await flush();
		expect(icon()).toHaveClass(ACTIVE_ICON);
	});
	it("[ISSUE-3494-ITEM-4] dialog mode: a Backend filter preset through defaultCustomData is not marked, and Reset filter unmarks a changed one", async () => {
		render(
			<Grid
				filterBar={TeamsBar}
				enableFilterDialogWidth={500}
				defaultCustomData={{ teams: ["x"] }}
			/>,
		);
		const button = await filterButton();
		const icon = () => button.querySelector("svg")!;
		// open the panel once, so the helper is mounted (and stays mounted)
		fireEvent.click(button);
		expect(idSelectorProps.current).toMatchObject({ selected: ["x"] });
		fireEvent.click(screen.getByRole("button", { name: "Close" }));
		await flush();
		expect(icon()).not.toHaveClass(ACTIVE_ICON);
		// a changed selection marks it
		act(() =>
			(idSelectorProps.current!.onSelect as (v: string[]) => void)(["x", "y"]),
		);
		await flush();
		expect(icon()).toHaveClass(ACTIVE_ICON);
		// "Reset filter" restores defaultCustomData, which unmarks it (the
		// narrow header has the reset menu under "More options")
		fireEvent.click(screen.getByRole("button", { name: "More options" }));
		fireEvent.click(await screen.findByRole("menuitem", { name: "Reset" }));
		fireEvent.click(
			await screen.findByRole("menuitem", { name: "Reset filter" }),
		);
		await flush();
		expect(idSelectorProps.current).toMatchObject({ selected: ["x"] });
		expect(icon()).not.toHaveClass(ACTIVE_ICON);
	});
	it("[ISSUE-3494-ITEM-4] dialog mode: the Filter button compares a list in any order, and an emptied non-empty default marks it", async () => {
		const cases: Array<[Partial<DataGridProps>, boolean]> = [
			[
				{
					defaultCustomData: { kinds: ["a", "b"] },
					overrideCustomData: { kinds: ["b", "a"] },
				},
				false,
			],
			[
				{
					defaultCustomData: { kinds: ["a", "b"] },
					overrideCustomData: { kinds: [] },
				},
				true,
			],
			[
				{
					defaultCustomData: { kinds: ["a", "b"], status: "" },
					overrideCustomData: { kinds: ["a", "b"] },
				},
				false,
			],
		];
		for (const [props, marked] of cases) {
			render(
				<Grid filterBar={KindsBar} enableFilterDialogWidth={500} {...props} />,
			);
			const button = await filterButton();
			await flush();
			expect(
				button.querySelector("svg")!.classList.contains(ACTIVE_ICON),
				JSON.stringify(props),
			).toBe(marked);
			cleanup();
		}
	});
});

describe("GridSingleSelectFilter, GridMultiSelectFilter: default and highlight from defaultCustomData", () => {
	it("[ISSUE-3494-ITEM-4] GridSingleSelectFilter shows defaultCustomData[field] while selected is unset, and is highlighted only while its value differs from it", async () => {
		const cases: Array<[Partial<DataGridProps>, string, boolean]> = [
			[{ defaultCustomData: { status: "a" } }, "A", false],
			[
				{ defaultCustomData: { status: "a" }, overrideCustomData: {} },
				"A",
				false,
			],
			[
				{
					defaultCustomData: { status: "a" },
					overrideCustomData: { status: "b" },
				},
				"B",
				true,
			],
			// "All" ("") is no filter, which differs from a non-empty default
			[
				{
					defaultCustomData: { status: "a" },
					overrideCustomData: { status: "" },
				},
				"All",
				true,
			],
			// without a default, the empty values are no filter
			[{ overrideCustomData: { status: "" } }, "All", false],
			[{ overrideCustomData: { status: null } }, "All", false],
			[{ overrideCustomData: { status: "b" } }, "B", true],
		];
		for (const [props, shown, outlined] of cases) {
			render(<Grid {...props} />);
			await flush();
			const [selector] = barSelectors();
			expect(
				within(selector).getByRole("combobox"),
				JSON.stringify(props),
			).toHaveValue(shown);
			expect(selector.classList.contains(OUTLINED), JSON.stringify(props)).toBe(
				outlined,
			);
			cleanup();
		}
	});
	it("[ISSUE-3494-ITEM-4] GridSingleSelectFilter in the panel checks defaultCustomData[field] while selected is unset", async () => {
		render(
			<Grid
				enableFilterDialogWidth={500}
				defaultCustomData={{ status: "a" }}
				overrideCustomData={{}}
			/>,
		);
		fireEvent.click(await filterButton());
		expect(screen.getByRole("radio", { name: "A" })).toBeChecked();
		expect(screen.getByRole("radio", { name: "All" })).not.toBeChecked();
	});
	it("[ISSUE-3494-ITEM-4] GridMultiSelectFilter shows defaultCustomData[field] while selected is unset, and is highlighted only while its entries differ from it, in any order", async () => {
		const cases: Array<[Partial<DataGridProps>, boolean]> = [
			[{ defaultCustomData: { kinds: ["a", "b"] } }, false],
			[
				{ defaultCustomData: { kinds: ["a", "b"] }, overrideCustomData: {} },
				false,
			],
			[
				{
					defaultCustomData: { kinds: ["a", "b"] },
					overrideCustomData: { kinds: ["b", "a"] },
				},
				false,
			],
			[
				{
					defaultCustomData: { kinds: ["a", "b"] },
					overrideCustomData: { kinds: ["a"] },
				},
				true,
			],
			[
				{
					defaultCustomData: { kinds: ["a", "b"] },
					overrideCustomData: { kinds: [] },
				},
				true,
			],
			[{ overrideCustomData: { kinds: [] } }, false],
			[{ overrideCustomData: { kinds: ["a"] } }, true],
		];
		for (const [props, outlined] of cases) {
			render(<Grid filterBar={KindsBar} {...props} />);
			await flush();
			const [selector] = barSelectors();
			expect(selector.classList.contains(OUTLINED), JSON.stringify(props)).toBe(
				outlined,
			);
			cleanup();
		}
		// the panel ticks the default's entries while selected is unset
		render(
			<Grid
				filterBar={KindsBar}
				enableFilterDialogWidth={500}
				defaultCustomData={{ kinds: ["a", "b"] }}
				overrideCustomData={{}}
			/>,
		);
		fireEvent.click(await filterButton());
		expect(screen.getByRole("checkbox", { name: "A" })).toBeChecked();
		expect(screen.getByRole("checkbox", { name: "B" })).toBeChecked();
	});
});

describe("isDataGridCustomFilterActive, areDataGridCustomFiltersActive", () => {
	it('[ISSUE-3494-ITEM-4] a value is active while it differs from its default; empty values (undefined, null, "", []) count as unset, and lists compare in any order', () => {
		const cases: Array<[unknown, unknown, boolean]> = [
			[undefined, undefined, false],
			[null, undefined, false],
			["", undefined, false],
			[[], undefined, false],
			["", null, false],
			[[], "", false],
			["a", undefined, true],
			[undefined, "a", true],
			["", "a", true],
			["a", "a", false],
			["b", "a", true],
			[false, undefined, true],
			[0, undefined, true],
			[["a", "b"], ["b", "a"], false],
			[["a", "a", "b"], ["a", "b", "b"], true],
			[["a"], ["a", "b"], true],
			[[], ["a"], true],
			[{ from: 1 }, { from: 1 }, false],
			[{ from: 1 }, { from: 2 }, true],
		];
		for (const [value, defaultValue, active] of cases) {
			expect(
				isDataGridCustomFilterActive(value, defaultValue),
				JSON.stringify([value, defaultValue]),
			).toBe(active);
		}
	});
	it("[ISSUE-3494-ITEM-4] custom data is active while one of its keys or one of the default's keys is", () => {
		expect(areDataGridCustomFiltersActive({}, undefined)).toBe(false);
		expect(
			areDataGridCustomFiltersActive({ status: "", kinds: [] }, undefined),
		).toBe(false);
		expect(
			areDataGridCustomFiltersActive(
				{ status: "a" },
				{ status: "a", kinds: [] },
			),
		).toBe(false);
		expect(areDataGridCustomFiltersActive({}, { status: "a" })).toBe(true);
		expect(areDataGridCustomFiltersActive({ archive: true }, {})).toBe(true);
		expect(
			areDataGridCustomFiltersActive(
				{ status: "a", kinds: ["y", "x"] },
				{ status: "a", kinds: ["x", "y"] },
			),
		).toBe(false);
	});
});
