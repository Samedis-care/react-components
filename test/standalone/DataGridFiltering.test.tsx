import React, { useState } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import ccI18n from "../../src/i18n";
import FilterEntry, {
	type IFilterDef,
} from "../../src/standalone/DataGrid/Content/FilterEntry";
import {
	DataGridPropsContext,
	type DataGridProps,
	type DataGridSetFilterData,
	type IDataGridColumnDef,
} from "../../src/standalone/DataGrid/DataGrid";
import type { ModelFilterType } from "../../src/backend-integration/Model";
import { CustomFilterActiveContext } from "../../src/standalone/DataGrid/Header/FilterBar";
import userEvent from "@testing-library/user-event";
import GridSingleSelectFilter from "../../src/standalone/DataGrid/GridSingleSelectFilter";

beforeAll(async () => {
	await ccI18n.init();
	await ccI18n.changeLanguage("en");
});

afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.restoreAllMocks();
});

const theme = createTheme();

// --- Grid*Filter harness ---------------------------------------------------
// the filters inside the grid's two contexts, with the active counter exposed
let activeCount = 0;

const Ctx = (p: {
	children: React.ReactNode;
	classes?: DataGridProps["classes"];
	theme?: ReturnType<typeof createTheme>;
}) => {
	const pack = useState(0);
	activeCount = pack[0];
	return (
		<ThemeProvider theme={p.theme ?? theme}>
			<DataGridPropsContext.Provider
				value={{ classes: p.classes } as DataGridProps}
			>
				<CustomFilterActiveContext.Provider value={pack}>
					{p.children}
				</CustomFilterActiveContext.Provider>
			</DataGridPropsContext.Provider>
		</ThemeProvider>
	);
};

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
			defaultSelection=""
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
					defaultSelection=""
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
				<PanelSingle initial="" onSelect={second} label="Kind" />
			</Ctx>,
		);
		const radios = screen.getAllByRole<HTMLInputElement>("radio");
		expect(new Set(radios.map((r) => r.name)).size).toBe(2);
		await user.tab();
		expect(radios[2]).toHaveFocus();
		expect(activeCount).toBe(1);
		// the last option of the first filter wraps to its own first option
		await user.keyboard("{ArrowDown}");
		expect(first).toHaveBeenLastCalledWith("");
		expect(radios[0]).toHaveFocus();
		expect(second).not.toHaveBeenCalled();
		// both filters are back at their default
		expect(activeCount).toBe(0);
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
