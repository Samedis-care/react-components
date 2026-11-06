import React, { useState } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
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
