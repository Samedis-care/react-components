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
import { computeAccessibleName } from "dom-accessibility-api";
import ccI18n, { langs } from "../../src/i18n";
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
	useDataGridColumnState,
	useDataGridState,
} from "../../src/standalone/DataGrid/DataGrid";
import type { ModelFilterType } from "../../src/backend-integration/Model";
import type { IDataGridFilterBarProps } from "../../src/standalone/DataGrid/Header/FilterBar";
import CustomFiltersButton from "../../src/standalone/DataGrid/Header/CustomFiltersButton";
import userEvent from "@testing-library/user-event";
import fs from "node:fs";
import path from "node:path";
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
	it("[ISSUE-3494-ITEM-12] dialog: hidden options are not listed, disabled ones cannot be picked, a [text, node] label shows once", () => {
		const onSelect = vi.fn();
		render(
			<Ctx>
				<GridSingleSelectFilter
					options={[
						{ value: "a", label: ["Alpha", <b key="n">ALPHA-NODE</b>] },
						{ value: "h", label: "Hidden one", hidden: true },
						{ value: "d", label: "Disabled one", isDisabled: true },
					]}
					selected="a"
					field="status"
					onSelect={onSelect}
					dialog
				/>
			</Ctx>,
		);
		expect(screen.queryByText("Hidden one")).toBeNull();
		expect(screen.getByRole("radio", { name: "Disabled one" })).toBeDisabled();
		// the text part is not printed before the node (an element whose whole
		// text is both: the default matcher reads only an element's own text)
		expect(
			screen.queryAllByText((_, el) => el?.textContent === "AlphaALPHA-NODE"),
		).toHaveLength(0);
		// the radio is named by the node alone, as the bar's list shows it
		expect(screen.getByRole("radio", { name: "ALPHA-NODE" })).toBeChecked();
		expect(screen.getAllByRole("radio")).toHaveLength(2);
		fireEvent.click(screen.getByText("Disabled one"));
		expect(onSelect).not.toHaveBeenCalled();
	});
	it("[ISSUE-3494-ITEM-12] dialog: a small label with a [text, node] label shows its node", () => {
		render(
			<Ctx>
				<GridSingleSelectFilter
					options={[
						{
							value: "g",
							label: ["Group", <b key="n">GROUP-NODE</b>],
							isSmallLabel: true,
						},
						{ value: "a", label: "A" },
					]}
					selected="a"
					field="status"
					onSelect={vi.fn()}
					dialog
				/>
			</Ctx>,
		);
		expect(screen.getByText("GROUP-NODE")).toBeInTheDocument();
		expect(screen.queryByText("Group")).toBeNull();
	});
});

describe("GridMultiSelectFilter", () => {
	it("[ISSUE-3494-ITEM-12] dialog: hidden options are not listed, disabled ones cannot be picked, a [text, node] label shows once", () => {
		const onSelect = vi.fn();
		render(
			<Ctx>
				<GridMultiSelectFilter
					options={[
						{ value: "a", label: ["Alpha", <b key="n">ALPHA-NODE</b>] },
						{ value: "h", label: "Hidden one", hidden: true },
						{ value: "d", label: "Disabled one", isDisabled: true },
					]}
					selected={[]}
					field="kinds"
					onSelect={onSelect}
					dialog
				/>
			</Ctx>,
		);
		expect(screen.queryByText("Hidden one")).toBeNull();
		expect(
			screen.getByRole("checkbox", { name: "Disabled one" }),
		).toBeDisabled();
		// the text part is not printed before the node (an element whose whole
		// text is both: the default matcher reads only an element's own text)
		expect(
			screen.queryAllByText((_, el) => el?.textContent === "AlphaALPHA-NODE"),
		).toHaveLength(0);
		// the checkbox is named by the node alone, as the bar's list shows it
		expect(
			screen.getByRole("checkbox", { name: "ALPHA-NODE" }),
		).toBeInTheDocument();
		expect(screen.getAllByRole("checkbox")).toHaveLength(2);
		fireEvent.click(screen.getByText("Disabled one"));
		expect(onSelect).not.toHaveBeenCalled();
	});
	it("[ISSUE-3494-ITEM-12] dialog: a small label with a [text, node] label shows its node", () => {
		render(
			<Ctx>
				<GridMultiSelectFilter
					options={[
						{
							value: "g",
							label: ["Group", <b key="n">GROUP-NODE</b>],
							isSmallLabel: true,
						},
						{ value: "a", label: "A" },
					]}
					selected={[]}
					field="kinds"
					onSelect={vi.fn()}
					dialog
				/>
			</Ctx>,
		);
		expect(screen.getByText("GROUP-NODE")).toBeInTheDocument();
		expect(screen.queryByText("Group")).toBeNull();
	});
	it("[ISSUE-3494-ITEM-12] dialog: a selected hidden or disabled value stays selected when another value is ticked", () => {
		const onSelect = vi.fn();
		render(
			<Ctx>
				<GridMultiSelectFilter
					options={[
						{ value: "a", label: "A" },
						{ value: "h", label: "Hidden one", hidden: true },
						{ value: "d", label: "Disabled one", isDisabled: true },
					]}
					selected={["h", "d"]}
					field="kinds"
					onSelect={onSelect}
					dialog
				/>
			</Ctx>,
		);
		expect(
			screen.getByRole("checkbox", { name: "Disabled one" }),
		).toBeChecked();
		fireEvent.click(screen.getByRole("checkbox", { name: "A" }));
		expect(onSelect).toHaveBeenLastCalledWith(["h", "d", "a"]);
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
	it("[ISSUE-3494-ITEM-2] unticking None after A, B and None leaves no empty condition", () => {
		renderEntry({ valueType: "enum", valueData: ENUM3 });
		fireEvent.click(box("a"));
		fireEvent.click(box("b"));
		fireEvent.click(box(MAGIC));
		expect(last).toMatchObject({
			value1: `a,b,${MAGIC}`,
			nextFilterType: "or",
			nextFilter: { type: "empty" },
		});
		fireEvent.click(box(MAGIC));
		expect(last).toMatchObject({ type: "inSet", value1: "a,b" });
		expect(last!.nextFilter).toBeUndefined();
	});
	it("[ISSUE-3494-ITEM-2] Select all, then unticking None, leaves no empty condition", () => {
		renderEntry({ valueType: "enum", valueData: ENUM6 });
		fireEvent.click(
			screen.getByText("Select all").closest("li")!.querySelector("input")!,
		);
		fireEvent.click(box(MAGIC));
		expect(last).toMatchObject({ type: "inSet", value1: "a,b,c,d,e" });
		expect(last!.nextFilter).toBeUndefined();
	});
	it("[ISSUE-3494-ITEM-2] inverted: unticking None after A, B and None leaves no notEmpty condition", () => {
		renderEntry({
			valueType: "enum",
			valueData: ENUM3,
			initial: {
				type: "notInSet",
				value1: `a,b,${MAGIC}`,
				value2: "",
				nextFilterType: "and",
				nextFilter: { type: "notEmpty", value1: "notEmpty", value2: "" },
			},
		});
		fireEvent.click(box(MAGIC));
		expect(last).toMatchObject({ type: "notInSet", value1: "a,b" });
		expect(last!.nextFilter).toBeUndefined();
	});
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
			// the bar has no width in jsdom: 0 keeps it in the header
			enableFilterDialogWidth={0}
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
		fireEvent.click(screen.getByRole("button", { name: "Show results" }));
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
			fireEvent.click(screen.getByRole("button", { name: "Show results" }));
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
		fireEvent.click(screen.getByRole("button", { name: "Show results" }));
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
		fireEvent.click(screen.getByRole("button", { name: "Show results" }));
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
	it("[ISSUE-3494-ITEM-25] the panel's Filter button exposes whether the panel is open, under a name of its own", async () => {
		render(<Grid enableFilterDialogWidth={500} />);
		const button = await filterButton();
		// "Filter" is also the name of every column header's filter button
		expect(computeAccessibleName(button)).not.toBe(
			ccI18n.t("standalone.data-grid.content.filter"),
		);
		expect(button).toHaveAttribute("aria-expanded", "false");
	});
	it("[ISSUE-3494-ITEM-25] the panel's button keeps its text Filter, is named Filter selection, and is expanded while the panel is open", async () => {
		render(<Grid enableFilterDialogWidth={500} />);
		const button = await filterButton();
		expect(button).toHaveTextContent(/^Filter$/);
		expect(button).toHaveAccessibleName("Filter selection");
		fireEvent.click(button);
		expect(panelOpen()).toBe(true);
		expect(button).toHaveAttribute("aria-expanded", "true");
		// the panel closes through its footer's "Show results" (ISSUE-3494-ITEM-32)
		fireEvent.click(screen.getByRole("button", { name: "Show results" }));
		expect(panelOpen()).toBe(false);
		expect(button).toHaveAttribute("aria-expanded", "false");
	});
	it("[ISSUE-3494-ITEM-25] in every locale, the panel button's name starts with its text and is not the column filter buttons' name", async () => {
		await ccI18n.loadLanguages(langs);
		const resource = (lng: string, key: string) =>
			ccI18n.getResource(lng.split("-")[0], "translation", key) as
				string | undefined;
		const wrong = langs.filter((lng) => {
			const text = resource(
				lng,
				"standalone.data-grid.header.custom-filter-button",
			);
			const name = resource(
				lng,
				"standalone.data-grid.header.custom-filter-button-label",
			);
			const columnName = resource(lng, "standalone.data-grid.content.filter");
			if (!text || !name || !columnName) return true;
			// the visible text comes first, as a word of its own (WCAG 2.5.3)
			const startsWithText =
				name.toLowerCase().startsWith(text.toLowerCase()) &&
				!/\p{L}/u.test(name.charAt(text.length));
			return !startsWithText || name.toLowerCase() === columnName.toLowerCase();
		});
		expect(wrong, "locales with a wrong name").toEqual([]);
	});
	it("[ISSUE-3494-ITEM-25] an aria-label or aria-expanded given to the button replaces its own", async () => {
		const goBack = vi.fn();
		/** an app's bar that uses the button for an action of its own */
		const BackBar = () => (
			<CustomFiltersButton
				onClick={goBack}
				aria-label="Filter: change the filters"
				aria-expanded={undefined}
			/>
		);
		render(<Grid filterBar={BackBar} />);
		const button = await screen.findByRole("button", {
			name: "Filter: change the filters",
		});
		expect(button).toHaveTextContent(/^Filter$/);
		expect(button).not.toHaveAttribute("aria-expanded");
		fireEvent.click(button);
		expect(goBack).toHaveBeenCalledTimes(1);
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
	it("[ISSUE-3494-ITEM-11] a default selection that contains the empty value is not counted active", async () => {
		/** a multi-select with a "None" option whose value is "" */
		const NoneBar = (p: IDataGridFilterBarProps) => (
			<GridMultiSelectFilter
				label="Kinds"
				options={[
					{ value: "", label: "None" },
					{ value: "a", label: "A" },
				]}
				field="kinds"
				selected={p.customData.kinds as string[] | undefined}
				onSelect={(v) => p.setCustomData((o) => ({ ...o, kinds: v }))}
				dialog={p.inDialog}
			/>
		);
		// the bar does not outline it
		render(<Grid filterBar={NoneBar} defaultCustomData={{ kinds: [""] }} />);
		await flush();
		expect(barSelectors()[0]).not.toHaveClass(OUTLINED);
		cleanup();
		// the panel ticks "None", and its Filter button is not marked
		render(
			<Grid
				filterBar={NoneBar}
				enableFilterDialogWidth={500}
				defaultCustomData={{ kinds: [""] }}
			/>,
		);
		const button = await filterButton();
		fireEvent.click(button);
		expect(screen.getByRole("checkbox", { name: "None" })).toBeChecked();
		expect(screen.getByRole("checkbox", { name: "A" })).not.toBeChecked();
		fireEvent.click(screen.getByRole("button", { name: "Show results" }));
		await flush();
		expect(button.querySelector("svg")).not.toHaveClass(ACTIVE_ICON);
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

describe("FilterBar: the default of enableFilterDialogWidth", () => {
	/** the width the filter bar's container reports (jsdom lays nothing out) */
	const barWidth = (width: () => number) =>
		vi
			.spyOn(Element.prototype, "clientWidth", "get")
			.mockImplementation(function (this: Element) {
				return this.firstElementChild?.classList.contains(
					"components-care-data-grid-filter-bar",
				)
					? width()
					: 0;
			});
	/** a matchMedia that matches the given query only */
	const media = (matching: string) =>
		vi.stubGlobal(
			"matchMedia",
			(query: string) =>
				({
					matches: query === matching,
					media: query,
					onchange: null,
					addListener: () => {},
					removeListener: () => {},
					addEventListener: () => {},
					removeEventListener: () => {},
					dispatchEvent: () => false,
				}) as MediaQueryList,
		);
	const resize = () => act(() => observers.forEach((observer) => observer()));
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("[ISSUE-3494-ITEM-22] without enableFilterDialogWidth, a bar narrower than 600px is the Filter button, and from 600px on it shows its filters", async () => {
		let width = 165;
		barWidth(() => width);
		render(<Grid enableFilterDialogWidth={undefined} />);
		await filterButton();
		expect(barSelectors()).toHaveLength(0);
		width = 600;
		resize();
		await waitFor(() => expect(barSelectors()).toHaveLength(1));
		expect(document.querySelector(FILTER_BUTTON)).toBeNull();
		width = 599;
		resize();
		await filterButton();
		expect(barSelectors()).toHaveLength(0);
	});
	it("[ISSUE-3494-ITEM-22] enableFilterDialogWidth 0 shows the bar at any width", async () => {
		barWidth(() => 1);
		render(<Grid enableFilterDialogWidth={0} />);
		await flush();
		expect(barSelectors()).toHaveLength(1);
		expect(document.querySelector(FILTER_BUTTON)).toBeNull();
	});
	it("[FOLLOWUP-DROP-FILTER-DIALOG-MEDIAQUERY] a media query passed as enableFilterDialogMediaQuery neither hides nor shows the bar: the width decides", async () => {
		let width = 600;
		barWidth(() => width);
		media("(max-width: 1199.95px)");
		render(
			<Grid
				enableFilterDialogWidth={undefined}
				// @ts-expect-error enableFilterDialogMediaQuery is no longer a prop
				enableFilterDialogMediaQuery="(max-width: 1199.95px)"
			/>,
		);
		await flush();
		expect(barSelectors()).toHaveLength(1);
		expect(document.querySelector(FILTER_BUTTON)).toBeNull();
		cleanup();
		width = 165;
		render(
			<Grid
				enableFilterDialogWidth={undefined}
				// @ts-expect-error enableFilterDialogMediaQuery is no longer a prop
				enableFilterDialogMediaQuery="(max-width: 899.95px)"
			/>,
		);
		await filterButton();
		expect(barSelectors()).toHaveLength(0);
	});
});

// --- ISSUE-3494-ITEM-32: the panel's footer; its lists, or the bar's selects on a phone
/** the theme's phone breakpoint (xs), as useMediaQuery hands it to matchMedia */
const PHONE_QUERY = theme.breakpoints.only("xs").replace(/^@media ?/, "");

/**
 * Sets the viewport to a phone's (it matches PHONE_QUERY) or a wider one.
 * Returns a function that changes it later and tells the listeners, as a
 * turned phone does.
 */
const viewport = (phone: boolean) => {
	const listeners = new Set<() => void>();
	vi.stubGlobal(
		"matchMedia",
		(query: string) =>
			({
				get matches() {
					return phone && query === PHONE_QUERY;
				},
				media: query,
				onchange: null,
				addListener: (listener: () => void) => listeners.add(listener),
				removeListener: (listener: () => void) => listeners.delete(listener),
				addEventListener: (_type: string, listener: () => void) =>
					listeners.add(listener),
				removeEventListener: (_type: string, listener: () => void) =>
					listeners.delete(listener),
				dispatchEvent: () => false,
			}) as unknown as MediaQueryList,
	);
	return (next: boolean) => {
		phone = next;
		act(() => listeners.forEach((listener) => listener()));
	};
};

/** the combobox of a bar or panel filter (its label names it) */
const filterCombobox = (container: HTMLElement, label: string) =>
	within(container).getByRole<HTMLInputElement>("combobox", { name: label });

/** opens a bar or panel filter's select and picks an option */
const pickInSelect = async (combobox: HTMLElement, option: string) => {
	act(() => combobox.focus());
	fireEvent.mouseDown(combobox);
	await flush();
	fireEvent.click(screen.getByRole("option", { name: option }));
	await flush();
};

let panelGrid: {
	state: IDataGridState;
	columnState: ReturnType<typeof useDataGridColumnState>[0];
} | null = null;

/** Status (single), Kinds (multi) and Teams (Backend multi), as an app's bar */
const PanelBar = (p: IDataGridFilterBarProps) => {
	const [state] = useDataGridState();
	const [columnState] = useDataGridColumnState();
	panelGrid = { state, columnState };
	return (
		<>
			<GridSingleSelectFilter
				label="Status"
				options={OPTIONS}
				field="status"
				selected={p.customData.status as string | undefined}
				onSelect={(v) => p.setCustomData((o) => ({ ...o, status: v }))}
				dialog={p.inDialog}
			/>
			<GridMultiSelectFilter
				label="Kinds"
				options={OPTIONS.slice(1)}
				field="kinds"
				selected={p.customData.kinds as string[] | undefined}
				onSelect={(v) => p.setCustomData((o) => ({ ...o, kinds: v }))}
				dialog={p.inDialog}
			/>
			<GridMultiSelectFilterBackend
				model={{} as never}
				modelToSelectorData={(() => ({})) as never}
				label="Teams"
				selected={(p.customData.teams as string[] | undefined) ?? []}
				onSelect={(v) => p.setCustomData((o) => ({ ...o, teams: v }))}
				dialog={p.inDialog}
			/>
		</>
	);
};

/** three rows; a status filter leaves one */
const countedLoad = vi.fn(
	({ additionalFilters }: { additionalFilters: Record<string, unknown> }) =>
		({
			rowsTotal: 3,
			rowsFiltered: additionalFilters.status ? 1 : null,
			rows: [{ id: "1", name: "x" }],
		}) as DataGridData,
);

const PanelGrid = (p: Partial<DataGridProps>) => (
	<Grid
		filterBar={PanelBar}
		loadData={countedLoad}
		enableFilterDialogWidth={500}
		classes={{ header: "my-header", contentOverlayPaper: "my-panel" }}
		{...p}
	/>
);

/** opens the panel and returns it */
const openPanel = async () => {
	fireEvent.click(await filterButton());
	await flush();
	const panel = Array.from(
		document.querySelectorAll<HTMLElement>(".my-panel"),
	).find((paper) => within(paper).queryByText("Filter selection"));
	if (!panel) throw new Error("the panel is not open");
	return panel;
};

describe("CustomFilterDialog: lists where there is room, the bar's selects on a phone", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("[ISSUE-3494-ITEM-32] wider than a phone the panel keeps its lists, so an option is one click: radios, checkboxes, and the picked records below the Backend selector", async () => {
		viewport(false);
		render(
			<PanelGrid
				overrideCustomData={{ status: "a", kinds: ["b"], teams: ["t1"] }}
			/>,
		);
		const panel = await openPanel();
		expect(within(panel).queryAllByRole("combobox")).toHaveLength(0);
		expect(within(panel).getAllByRole("radio")).toHaveLength(3);
		expect(within(panel).getByRole("radio", { name: "A" })).toBeChecked();
		expect(within(panel).getAllByRole("checkbox")).toHaveLength(2);
		expect(within(panel).getByRole("checkbox", { name: "B" })).toBeChecked();
		// GridMultiSelectFilterBackend: the selector with the list of records
		expect(within(panel).getByTestId("backend-multi-select")).toBeTruthy();
		expect(within(panel).queryByTestId("backend-multiple-select")).toBeNull();
		expect(idSelectorProps.current).toMatchObject({ selected: ["t1"] });
		// a click on an option applies it
		fireEvent.click(within(panel).getByRole("radio", { name: "B" }));
		fireEvent.click(within(panel).getByRole("checkbox", { name: "A" }));
		await flush();
		expect(panelGrid!.state.customData).toEqual({
			status: "b",
			kinds: ["b", "a"],
			teams: ["t1"],
		});
	});
	it("[ISSUE-3494-ITEM-32] on a phone the panel shows each helper with the bar's select: one row per filter, no lists", async () => {
		viewport(true);
		render(<PanelGrid overrideCustomData={{ status: "a", kinds: ["b"] }} />);
		const panel = await openPanel();
		expect(within(panel).queryAllByRole("radio")).toHaveLength(0);
		expect(within(panel).queryAllByRole("checkbox")).toHaveLength(0);
		expect(filterCombobox(panel, "Status")).toHaveValue("A");
		expect(filterCombobox(panel, "Kinds").value.trim()).toBe("B");
		// GridMultiSelectFilterBackend: the bar's selector, not the list of records
		expect(within(panel).queryByTestId("backend-multi-select")).toBeNull();
		expect(within(panel).getByTestId("backend-multiple-select")).toBeTruthy();
		expect(idSelectorProps.current).toBeNull();
		// a pick applies it, and the select is outlined as in the bar
		await pickInSelect(filterCombobox(panel, "Status"), "B");
		expect(panelGrid!.state.customData).toMatchObject({ status: "b" });
		expect(filterCombobox(panel, "Status")).toHaveValue("B");
		expect(
			filterCombobox(panel, "Status").closest(".MuiAutocomplete-root"),
		).toHaveClass(OUTLINED);
	});
	it("[ISSUE-3494-ITEM-32] on a phone the bar and the panel render the same selector for each helper", async () => {
		viewport(true);
		// the selects by name and value, and the (mocked) Backend selectors
		const selectorsOf = (container: HTMLElement) =>
			Array.from(
				container.querySelectorAll<HTMLElement>(
					"[role=combobox], [data-testid^=backend-]",
				),
			).map((element) =>
				element instanceof HTMLInputElement
					? `select: ${element.value.trim()}`
					: element.getAttribute("data-testid"),
			);
		const custom = { status: "a", kinds: ["b"] };
		render(
			<PanelGrid enableFilterDialogWidth={0} overrideCustomData={custom} />,
		);
		await flush();
		const bar = document.querySelector<HTMLElement>(
			".components-care-data-grid-filter-bar",
		)!;
		const inBar = selectorsOf(bar);
		expect(inBar).toHaveLength(3);
		cleanup();
		render(<PanelGrid overrideCustomData={custom} />);
		const panel = await openPanel();
		expect(selectorsOf(panel)).toEqual(inBar);
	});
	it("[ISSUE-3494-ITEM-32] the open panel follows the viewport: turned wide it shows the lists, turned back the selects, and the picks stay", async () => {
		const setPhone = viewport(true);
		render(<PanelGrid overrideCustomData={{ status: "a", kinds: ["b"] }} />);
		const panel = await openPanel();
		expect(filterCombobox(panel, "Status")).toHaveValue("A");
		expect(within(panel).getByTestId("backend-multiple-select")).toBeTruthy();
		setPhone(false);
		await flush();
		expect(within(panel).queryAllByRole("combobox")).toHaveLength(0);
		expect(within(panel).getByRole("radio", { name: "A" })).toBeChecked();
		expect(within(panel).getByRole("checkbox", { name: "B" })).toBeChecked();
		expect(within(panel).getByTestId("backend-multi-select")).toBeTruthy();
		setPhone(true);
		await flush();
		expect(within(panel).queryAllByRole("radio")).toHaveLength(0);
		expect(filterCombobox(panel, "Status")).toHaveValue("A");
		expect(filterCombobox(panel, "Kinds").value.trim()).toBe("B");
		expect(panelGrid!.state.customData).toEqual({ status: "a", kinds: ["b"] });
	});
	it("[ISSUE-3494-ITEM-32] dialog on a phone: GridSingleSelectFilter and GridMultiSelectFilter alone are the bar's selects, named by their labels", () => {
		viewport(true);
		render(
			<Ctx>
				<GridSingleSelectFilter
					label="Status"
					options={OPTIONS}
					selected="a"
					field="status"
					onSelect={vi.fn()}
					dialog
				/>
				<GridMultiSelectFilter
					label="Kinds"
					options={OPTIONS.slice(1)}
					selected={["a", "b"]}
					field="kinds"
					onSelect={vi.fn()}
					dialog
				/>
			</Ctx>,
		);
		expect(screen.queryAllByRole("radio")).toHaveLength(0);
		expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
		expect(screen.getByRole("combobox", { name: "Status" })).toHaveValue("A");
		expect(
			screen
				.getByRole<HTMLInputElement>("combobox", { name: "Kinds" })
				.value.trim(),
		).toBe("A, B");
	});
	it("[ISSUE-3494-ITEM-32] on a phone the panel leaves autocompleteId to the bar: a panel still mounted after the grid widened does not repeat the id", async () => {
		viewport(true);
		const IdBar = (p: IDataGridFilterBarProps) => (
			<GridSingleSelectFilter
				label="Status"
				options={OPTIONS}
				field="status"
				selected={p.customData.status as string | undefined}
				onSelect={(v) => p.setCustomData((o) => ({ ...o, status: v }))}
				dialog={p.inDialog}
				autocompleteId="status-filter"
			/>
		);
		render(
			<PanelGrid
				filterBar={IdBar}
				classes={{
					header: "my-header",
					contentOverlayPaper: "my-panel",
					filterBarBox: "my-bar-box",
				}}
			/>,
		);
		const panel = await openPanel();
		expect(filterCombobox(panel, "Status")).toBeTruthy();
		// the grid gets wider than enableFilterDialogWidth: the bar is back
		Object.defineProperty(
			document.querySelector(".my-bar-box")!,
			"clientWidth",
			{
				configurable: true,
				get: () => 1000,
			},
		);
		act(() => observers.forEach((observe) => observe()));
		await flush();
		expect(panelOpen()).toBe(false);
		expect(document.querySelectorAll("#status-filter")).toHaveLength(1);
		expect(
			document.querySelector(
				".components-care-data-grid-filter-bar #status-filter",
			),
		).toBeTruthy();
	});
});

describe("CustomFilterDialog: the footer with the row count, Reset and Show results", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("[ISSUE-3494-ITEM-32] a click in the panel applies at once, and the panel shows the grid's row count", async () => {
		render(<PanelGrid />);
		const panel = await openPanel();
		const count = within(panel).getByRole("status");
		await waitFor(() => expect(count).toHaveTextContent("Total: 3"));
		expect(count).not.toHaveTextContent("Filtered");
		fireEvent.click(within(panel).getByRole("radio", { name: "A" }));
		await flush();
		expect(panelGrid!.state.customData).toMatchObject({ status: "a" });
		await waitFor(() =>
			expect(
				countedLoad.mock.calls.at(-1)?.[0].additionalFilters,
			).toMatchObject({ status: "a" }),
		);
		await waitFor(() =>
			expect(count).toHaveTextContent("Filtered: 1 Total: 3"),
		);
		expect(panelOpen()).toBe(true);
	});
	it("[ISSUE-3494-ITEM-32] the panel's count groups the digits as the footer does", async () => {
		render(
			<PanelGrid
				loadData={() => ({
					rowsTotal: 12345,
					rowsFiltered: 1234,
					rows: [{ id: "1", name: "x" }],
				})}
			/>,
		);
		const panel = await openPanel();
		await waitFor(() =>
			expect(within(panel).getByRole("status")).toHaveTextContent(
				"Filtered: 1,234 Total: 12,345",
			),
		);
	});
	it("[ISSUE-3494-ITEM-32] while the grid reloads, the panel's count stays at the last one and is busy, instead of counting 0 rows", async () => {
		let release: (() => void) | null = null;
		const load = vi.fn(
			({
				additionalFilters,
			}: {
				additionalFilters: Record<string, unknown>;
			}) =>
				additionalFilters.status
					? new Promise<DataGridData>((resolve) => {
							release = () =>
								resolve({
									rowsTotal: 3,
									rowsFiltered: 1,
									rows: [{ id: "1", name: "x" }],
								});
						})
					: { rowsTotal: 3, rows: [{ id: "1", name: "x" }] },
		);
		render(<PanelGrid loadData={load} />);
		const panel = await openPanel();
		const count = within(panel).getByRole("status");
		await waitFor(() => expect(count).toHaveTextContent("Total: 3"));
		expect(count).toHaveAttribute("aria-busy", "false");
		fireEvent.click(within(panel).getByRole("radio", { name: "A" }));
		// the reload is under way: the grid counts 0 rows until it is done
		await waitFor(() => expect(release).not.toBeNull());
		await flush();
		expect(panelGrid!.state.rowsTotal).toBe(0);
		expect(count).toHaveTextContent("Total: 3");
		expect(count).not.toHaveTextContent("Total: 0");
		expect(count).toHaveAttribute("aria-busy", "true");
		act(() => release!());
		await waitFor(() =>
			expect(count).toHaveTextContent("Filtered: 1 Total: 3"),
		);
		expect(count).toHaveAttribute("aria-busy", "false");
	});
	it("[ISSUE-3494-ITEM-32] after a failed load the panel shows no count, not the last one", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		// the first load works; the reload with a status filter fails
		const load = ({
			additionalFilters,
		}: {
			additionalFilters: Record<string, unknown>;
		}): DataGridData => {
			if (additionalFilters.status) throw new Error("offline");
			return { rowsTotal: 3, rows: [{ id: "1", name: "x" }] };
		};
		render(<PanelGrid loadData={load} />);
		const panel = await openPanel();
		const count = within(panel).getByRole("status");
		await waitFor(() => expect(count).toHaveTextContent("Total: 3"));
		fireEvent.click(within(panel).getByRole("radio", { name: "A" }));
		await waitFor(() => expect(panelGrid!.state.dataLoadError).not.toBeNull());
		await flush();
		expect(count).toHaveTextContent(/^$/);
		expect(count).toHaveAttribute("aria-busy", "false");
	});
	it('[ISSUE-3494-ITEM-32] "Show results" closes the panel and keeps the picks', async () => {
		render(<PanelGrid />);
		const panel = await openPanel();
		expect(within(panel).queryByRole("button", { name: "Close" })).toBeNull();
		act(() =>
			(idSelectorProps.current!.onSelect as (v: string[]) => void)(["t1"]),
		);
		fireEvent.click(
			within(panel).getByRole("button", { name: "Show results" }),
		);
		await flush();
		expect(panelOpen()).toBe(false);
		expect(panelGrid!.state.customData).toEqual({ teams: ["t1"] });
	});
	it("[ISSUE-3494-ITEM-32] the panel's Reset sets the custom data back to defaultCustomData, and leaves the search and the column filters alone", async () => {
		const nameFilter: IFilterDef = {
			type: "contains",
			value1: "x",
			value2: "",
		};
		render(
			<PanelGrid
				defaultCustomData={{ status: "a" }}
				overrideCustomData={{ status: "b", kinds: ["a"], teams: ["t1"] }}
				overrideSearch="foo"
				overrideFilter={[{ field: "name", filter: nameFilter }]}
			/>,
		);
		const panel = await openPanel();
		fireEvent.click(within(panel).getByRole("button", { name: "Reset" }));
		await flush();
		expect(panelGrid!.state.customData).toEqual({ status: "a" });
		expect(within(panel).getByRole("radio", { name: "A" })).toBeChecked();
		expect(
			within(panel).getByRole("checkbox", { name: "A" }),
		).not.toBeChecked();
		expect(idSelectorProps.current).toMatchObject({ selected: [] });
		expect(panelGrid!.state.search).toBe("foo");
		expect(panelGrid!.columnState.name.filter).toEqual(nameFilter);
		// the panel stays open
		expect(panelOpen()).toBe(true);
		// without defaultCustomData, Reset empties the custom data
		cleanup();
		render(<PanelGrid overrideCustomData={{ status: "b" }} />);
		fireEvent.click(
			within(await openPanel()).getByRole("button", { name: "Reset" }),
		);
		await flush();
		expect(panelGrid!.state.customData).toEqual({});
	});
	it("[ISSUE-3494-ITEM-32] with hideReset the panel has no Reset either", async () => {
		render(<PanelGrid hideReset overrideCustomData={{ status: "b" }} />);
		const panel = await openPanel();
		expect(within(panel).queryByRole("button", { name: "Reset" })).toBeNull();
		expect(
			within(panel).getByRole("button", { name: "Show results" }),
		).toBeTruthy();
	});
	it("[ISSUE-3494-ITEM-32] every locale has the panel's Reset and Show results", () => {
		const i18nDir = path.resolve(__dirname, "../../src/assets/i18n");
		const missing = fs
			.readdirSync(i18nDir, { withFileTypes: true })
			.filter((entry) => entry.isDirectory())
			.flatMap((entry) => {
				const translation = JSON.parse(
					fs.readFileSync(
						path.join(i18nDir, entry.name, "translation.json"),
						"utf8",
					),
				) as {
					standalone: {
						"data-grid": { "custom-filters": Record<string, string> };
					};
				};
				const keys = translation.standalone["data-grid"]["custom-filters"];
				return ["reset", "show-results"]
					.filter((key) => !keys[key]?.trim())
					.map((key) => `${entry.name}: custom-filters.${key}`);
			});
		expect(missing).toEqual([]);
	});
});
