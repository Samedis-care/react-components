import React, { useCallback, useState } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import ccI18n from "../../src/i18n";
import DataGrid, {
	DataGridData,
	DataGridDispatch,
	DataGridProps,
	DataGridRowData,
	IDataGridColumnDef,
	IDataGridColumnsState,
	IDataGridLoadDataParameters,
	IDataGridState,
	useDataGridColumnState,
	useDataGridColumnsWidthState,
	useDataGridState,
} from "../../src/standalone/DataGrid/DataGrid";
import {
	useDataGridFiltersActive,
	useDataGridResetFilters,
} from "../../src/standalone/DataGrid/DataGridUtils";
import type { IDataGridFilterBarProps } from "../../src/standalone/DataGrid/Header/FilterBar";

// MultiGrid reports the rendered row range as state.pages on every render, which
// overwrites what a test sets. Without it the test owns the paging; the cells and
// the empty state are MultiGrid's and Content's (samedis-care-issues#3472, samedis-care-issues#3493) and tested there.
vi.mock("../../src/standalone/Virtualized/MultiGrid", () => ({
	default: () => null,
}));

beforeAll(async () => {
	await ccI18n.init();
	await ccI18n.changeLanguage("en");
	// jsdom has neither; MUI's useMediaQuery and the filter bar need them
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
	window.ResizeObserver ??= class {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as never;
});

afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.restoreAllMocks();
	probe = null;
	localStorage.clear();
});

const theme = createTheme();

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
];

const ROWS: DataGridRowData[] = [
	{ id: "1", name: "Alice", role: "admin" },
	{ id: "2", name: "Bob", role: "user" },
];

const ok = (): DataGridData => ({ rowsTotal: 2, rows: ROWS });

type Probe = {
	state: IDataGridState;
	setState: React.Dispatch<React.SetStateAction<IDataGridState>>;
	columnState: IDataGridColumnsState;
	setColumnState: React.Dispatch<React.SetStateAction<IDataGridColumnsState>>;
	filtersActive: boolean;
	resetFilters: () => void;
	widths: Record<string, number>;
};

let probe: Probe | null = null;

/**
 * A filter bar renders inside all of the grid's providers, so it can read and
 * drive the grid's state through the exported hooks, as app filter bars do
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProbeBar = React.memo(function ProbeBar(_p: IDataGridFilterBarProps) {
	const [state, setState] = useDataGridState();
	const [columnState, setColumnState] = useDataGridColumnState();
	const filtersActive = useDataGridFiltersActive();
	const resetFilters = useDataGridResetFilters();
	const [widths] = useDataGridColumnsWidthState();
	probe = {
		state,
		setState,
		columnState,
		setColumnState,
		filtersActive,
		resetFilters,
		widths,
	};
	return null;
});

const Grid = (
	props: Partial<DataGridProps> & { gridRef?: React.Ref<DataGridDispatch> },
) => {
	const { gridRef, ...rest } = props;
	return (
		<ThemeProvider theme={theme}>
			<DataGrid
				ref={gridRef}
				columns={COLUMNS}
				loadData={ok}
				filterBar={ProbeBar}
				{...rest}
			/>
		</ThemeProvider>
	);
};

/** no load running or queued */
const idle = () =>
	waitFor(() => expect(probe?.state.refreshData).toBe(0), { timeout: 3000 });

describe("filters active / reset filters", () => {
	it("[ISSUE-3492-ITEM-6] a class instance in the custom data does not crash the grid", async () => {
		class DateRange {
			constructor(public from: string) {}
		}
		vi.spyOn(console, "error").mockImplementation(() => {});
		const range = new DateRange("2026-01-01");
		let thrown: unknown = null;
		try {
			render(<Grid defaultCustomData={{ range }} />);
		} catch (e) {
			thrown = e;
		}
		expect(thrown).toBeNull();
		await idle();
		expect(probe!.state.customData).toEqual({ range });
	});

	it.each([
		["a Map", new Map([["from", "2026-01-01"]])],
		["a function", () => "2026-01-01"],
	])(
		"[ISSUE-3492-ITEM-6] %s in the custom data does not crash the grid",
		async (_name, value) => {
			vi.spyOn(console, "error").mockImplementation(() => {});
			render(<Grid defaultCustomData={{ value }} />);
			await idle();
			expect(probe!.state.customData.value).toBe(value);
			expect(probe!.filtersActive).toBe(false);
		},
	);

	it("[ISSUE-3492-ITEM-6] a class instance the filter bar stores counts as a filter until it is the default's again", async () => {
		class DateRange {
			constructor(public from: string) {}
		}
		vi.spyOn(console, "error").mockImplementation(() => {});
		const defaultRange = new DateRange("2026-01-01");
		render(<Grid defaultCustomData={{ range: defaultRange }} />);
		await idle();
		expect(probe!.filtersActive).toBe(false);
		act(() =>
			probe!.setState((p) => ({
				...p,
				customData: { range: new DateRange("2026-02-01") },
			})),
		);
		expect(probe!.filtersActive).toBe(true);
		act(() => probe!.resetFilters());
		expect(probe!.state.customData.range).toBe(defaultRange);
		expect(probe!.filtersActive).toBe(false);
	});
});

/** past the 500ms debounce of the reload after a query change */
const passDebounce = () => act(() => void vi.advanceTimersByTime(700));

const loadSpy = (impl: (p: IDataGridLoadDataParameters) => DataGridData = ok) =>
	vi.fn<(p: IDataGridLoadDataParameters) => DataGridData>(impl);

const setSearch = (search: string) =>
	act(() => probe!.setState((p) => ({ ...p, search })));

/**
 * A parent that holds the selection and passes every change back in, as
 * BackendDataGridMultiSelect does
 */
const ControlledGrid = (props: Partial<DataGridProps>) => {
	const { onSelectionChange, ...rest } = props;
	const [selection, setSelection] = useState<[boolean, string[]]>([false, []]);
	const handleSelectionChange = useCallback(
		(invert: boolean, ids: string[]) => {
			setSelection([invert, ids]);
			onSelectionChange?.(invert, ids);
		},
		[onSelectionChange],
	);
	return (
		<Grid
			{...rest}
			selection={selection}
			onSelectionChange={handleSelectionChange}
		/>
	);
};

/** what a click on a row does (Content/Cell) */
const toggleRow = (id: string) =>
	act(() =>
		probe!.setState((p) => ({
			...p,
			selectedRows: p.selectedRows.includes(id)
				? p.selectedRows.filter((s) => s !== id)
				: [...p.selectedRows, id],
			selectionUpdatedByProps: false,
		})),
	);

describe("selection", () => {
	it("[ISSUE-3492-ITEM-1] a search keeps a selection set through the selection prop", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		const onSelectionChange = vi.fn();
		const SEL: [boolean, string[]] = [false, ["1"]];
		const loadData = loadSpy();
		render(
			<Grid
				loadData={loadData}
				selection={SEL}
				onSelectionChange={onSelectionChange}
			/>,
		);
		await idle();
		loadData.mockClear();
		setSearch("a");
		passDebounce();
		await waitFor(() => expect(loadData).toHaveBeenCalled());
		await idle();
		expect(probe!.state.selectedRows).toEqual(["1"]);
	});

	it.each<[string, (refreshWith: (token: string) => void) => void]>([
		["search", () => setSearch("a")],
		[
			"column filter",
			() =>
				act(() =>
					probe!.setColumnState((p) => ({
						...p,
						name: {
							...p.name,
							filter: { type: "contains", value1: "a", value2: "" },
						},
					})),
				),
		],
		[
			"sort",
			() =>
				act(() =>
					probe!.setColumnState((p) => ({
						...p,
						role: { ...p.role, sort: 1, sortOrder: 1 },
					})),
				),
		],
		[
			"custom data",
			() => act(() => probe!.setState((p) => ({ ...p, customData: { k: 1 } }))),
		],
		["forceRefreshToken", (refreshWith) => refreshWith("b")],
	])(
		"[ISSUE-3492-ITEM-1] a %s change keeps a controlled selection the user made, and reports nothing",
		async (_trigger, change) => {
			vi.useFakeTimers({ shouldAdvanceTime: true });
			const onSelectionChange = vi.fn();
			const loadData = loadSpy();
			const { rerender } = render(
				<ControlledGrid
					loadData={loadData}
					forceRefreshToken={"a"}
					onSelectionChange={onSelectionChange}
				/>,
			);
			await idle();
			toggleRow("2");
			expect(onSelectionChange).toHaveBeenLastCalledWith(false, ["2"]);
			onSelectionChange.mockClear();
			loadData.mockClear();
			change((token) =>
				rerender(
					<ControlledGrid
						loadData={loadData}
						forceRefreshToken={token}
						onSelectionChange={onSelectionChange}
					/>,
				),
			);
			passDebounce();
			await waitFor(() => expect(loadData).toHaveBeenCalled());
			await idle();
			expect(probe!.state.selectedRows).toEqual(["2"]);
			expect(onSelectionChange).not.toHaveBeenCalled();
		},
	);

	it("[ISSUE-3492-ITEM-1] a search keeps a controlled select all with its exceptions", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		const loadData = loadSpy();
		render(<Grid loadData={loadData} selection={[true, ["2"]]} />);
		await idle();
		loadData.mockClear();
		setSearch("a");
		passDebounce();
		await waitFor(() => expect(loadData).toHaveBeenCalled());
		await idle();
		expect(probe!.state.selectAll).toBe(true);
		expect(probe!.state.selectedRows).toEqual(["2"]);
	});

	it("[ISSUE-3492-ITEM-1] a search still clears the ids of a selection without the selection prop", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		const onSelectionChange = vi.fn();
		const loadData = loadSpy();
		render(<Grid loadData={loadData} onSelectionChange={onSelectionChange} />);
		await idle();
		toggleRow("2");
		expect(onSelectionChange).toHaveBeenLastCalledWith(false, ["2"]);
		loadData.mockClear();
		setSearch("a");
		passDebounce();
		await waitFor(() => expect(loadData).toHaveBeenCalled());
		await idle();
		expect(probe!.state.selectedRows).toEqual([]);
		expect(onSelectionChange).toHaveBeenLastCalledWith(false, []);
	});

	it("[ISSUE-3492-ITEM-1] after a search, a kept selection of the first rows no longer checks select all", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		const loadData = loadSpy();
		render(
			<ControlledGrid loadData={loadData} enableSelectAll limitSelectAll={1} />,
		);
		await idle();
		const selectAll = screen.getByRole("checkbox", { name: "First 1" });
		fireEvent.click(selectAll);
		await waitFor(() => expect(probe!.state.selectedRows).toEqual(["1"]));
		expect(selectAll).toBeChecked();
		loadData.mockClear();
		setSearch("a");
		passDebounce();
		await waitFor(() => expect(loadData).toHaveBeenCalled());
		await idle();
		// still Alice, but no longer known to be the first row of this result
		expect(probe!.state.selectedRows).toEqual(["1"]);
		expect(selectAll).not.toBeChecked();
		expect(selectAll).toHaveAttribute("data-indeterminate", "true");
	});

	it("[ISSUE-3492-ITEM-1] a delete reports the emptied selection to the parent that set it", async () => {
		const onSelectionChange = vi.fn();
		const onDelete = vi.fn(() => Promise.resolve());
		render(
			<Grid
				selection={[false, ["1"]]}
				onSelectionChange={onSelectionChange}
				onDelete={onDelete}
			/>,
		);
		await idle();
		onSelectionChange.mockClear();
		fireEvent.click(screen.getByRole("button", { name: "Delete" }));
		await waitFor(() =>
			expect(onSelectionChange).toHaveBeenCalledWith(false, []),
		);
		expect(onDelete).toHaveBeenCalledWith(false, ["1"], expect.anything());
		expect(probe!.state.selectedRows).toEqual([]);
	});
});
