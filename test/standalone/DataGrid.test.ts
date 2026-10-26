import { describe, it, expect, vi } from "vitest";
import {
	dataGridApplyRowUpdate,
	dataGridGetFilterParameters,
	dataGridGetQuery,
	dataGridIsCustomDataActionDisabled,
	dataGridLoadFirstRows,
	dataGridPrepareFiltersAndSorts,
} from "../../src/standalone/DataGrid/CallbackUtil";
import {
	getDataGridDefaultState,
	type DataGridCustomDataActionButton,
	type DataGridQuery,
	type DataGridRowData,
	type IDataGridColumnsState,
	type IDataGridLoadDataParameters,
	type IDataGridState,
} from "../../src/standalone/DataGrid/DataGrid";
import type { FilterType } from "../../src/standalone/DataGrid/Content/FilterEntry";

const makeFilter = (type: FilterType, value1: string, value2 = "") => ({
	type,
	value1,
	value2,
});

describe("dataGridPrepareFiltersAndSorts", () => {
	it("returns empty arrays for empty columns state", () => {
		const [sorts, filters] = dataGridPrepareFiltersAndSorts({});
		expect(sorts).toEqual([]);
		expect(filters).toEqual({});
	});

	it("extracts a single ascending sort", () => {
		const state: IDataGridColumnsState = {
			name: { sort: 1, sortOrder: 0 },
		};
		const [sorts] = dataGridPrepareFiltersAndSorts(state);
		expect(sorts).toEqual([{ field: "name", direction: 1 }]);
	});

	it("extracts a single descending sort", () => {
		const state: IDataGridColumnsState = {
			age: { sort: -1, sortOrder: 0 },
		};
		const [sorts] = dataGridPrepareFiltersAndSorts(state);
		expect(sorts).toEqual([{ field: "age", direction: -1 }]);
	});

	it("orders multiple sorts by sortOrder ascending", () => {
		const state: IDataGridColumnsState = {
			age: { sort: 1, sortOrder: 2 },
			name: { sort: -1, sortOrder: 1 },
			role: { sort: 1, sortOrder: 0 },
		};
		const [sorts] = dataGridPrepareFiltersAndSorts(state);
		expect(sorts.map((s) => s.field)).toEqual(["role", "name", "age"]);
	});

	it("ignores columns with sort = 0", () => {
		const state: IDataGridColumnsState = {
			name: { sort: 0, sortOrder: 0 },
			age: { sort: 1, sortOrder: 0 },
		};
		const [sorts] = dataGridPrepareFiltersAndSorts(state);
		expect(sorts).toHaveLength(1);
		expect(sorts[0].field).toBe("age");
	});

	it("extracts filters with a non-empty value1", () => {
		const filter = makeFilter("contains", "Alice");
		const state: IDataGridColumnsState = {
			name: { sort: 0, sortOrder: 0, filter },
		};
		const [, filters] = dataGridPrepareFiltersAndSorts(state);
		expect(filters).toEqual({ name: filter });
	});

	it("omits filters with empty value1", () => {
		const state: IDataGridColumnsState = {
			name: { sort: 0, sortOrder: 0, filter: makeFilter("contains", "") },
		};
		const [, filters] = dataGridPrepareFiltersAndSorts(state);
		expect(filters).toEqual({});
	});

	it("omits columns without a filter set", () => {
		const state: IDataGridColumnsState = {
			name: { sort: 0, sortOrder: 0 },
		};
		const [, filters] = dataGridPrepareFiltersAndSorts(state);
		expect(filters).toEqual({});
	});

	it("returns both sorts and filters together", () => {
		const filter = makeFilter("equals", "admin");
		const state: IDataGridColumnsState = {
			name: { sort: 1, sortOrder: 0 },
			role: { sort: 0, sortOrder: 0, filter },
		};
		const [sorts, filters] = dataGridPrepareFiltersAndSorts(state);
		expect(sorts).toEqual([{ field: "name", direction: 1 }]);
		expect(filters).toEqual({ role: filter });
	});
});

describe("dataGridApplyRowUpdate", () => {
	const makeState = (): IDataGridState => ({
		...getDataGridDefaultState([], undefined),
		rows: {
			0: { id: "1", name: "Alice", role: "admin" },
			1: { id: "2", name: "Bob", role: "user" },
		},
	});

	it("merges the changed fields into the row", () => {
		const state = makeState();
		const updated = dataGridApplyRowUpdate(state, "2", { role: "manager" });
		expect(updated.rows[1]).toEqual({
			id: "2",
			name: "Bob",
			role: "manager",
		});
	});

	it("passes the current row data to an updater function", () => {
		const state = makeState();
		const updated = dataGridApplyRowUpdate(state, "1", (row) => ({
			name: `${row.name as string} Müller`,
		}));
		expect(updated.rows[0]).toEqual({
			id: "1",
			name: "Alice Müller",
			role: "admin",
		});
	});

	it("keeps the row ID", () => {
		const state = makeState();
		const updated = dataGridApplyRowUpdate(state, "1", {
			id: "changed",
		} as never);
		expect(updated.rows[0].id).toBe("1");
	});

	it("leaves the other rows and the rest of the state alone", () => {
		const state = makeState();
		const updated = dataGridApplyRowUpdate(state, "1", { role: "user" });
		expect(updated.rows[1]).toBe(state.rows[1]);
		expect(updated.selectedRows).toBe(state.selectedRows);
		expect(updated.refreshData).toBe(state.refreshData);
	});

	it("returns the state unchanged if the row isn't loaded", () => {
		const state = makeState();
		expect(dataGridApplyRowUpdate(state, "404", { role: "user" })).toBe(state);
	});
});

describe("dataGridGetFilterParameters", () => {
	const columnsState: IDataGridColumnsState = {
		name: { sort: 1, sortOrder: 0, filter: makeFilter("contains", "ali") },
		role: { sort: 0 },
	};
	const state = { search: "müller", customData: { "filter[active]": true } };

	it("returns the search, the column filters and the additional filters", () => {
		expect(
			dataGridGetFilterParameters(state, columnsState, (customData) => ({
				active: customData["filter[active]"],
			})),
		).toEqual({
			quickFilter: "müller",
			fieldFilter: { name: makeFilter("contains", "ali") },
			additionalFilters: { active: true },
		});
	});

	it("uses the custom data as additional filters without getAdditionalFilters, like loadData", () => {
		expect(
			dataGridGetFilterParameters(state, columnsState, undefined)
				.additionalFilters,
		).toEqual({ "filter[active]": true });
	});
});

describe("dataGridGetQuery", () => {
	const columnsState: IDataGridColumnsState = {
		name: { sort: 0, filter: makeFilter("contains", "ali") },
		age: { sort: -1, sortOrder: 2 },
		role: { sort: 1, sortOrder: 1 },
	};
	const state = { search: "müller", customData: { "filter[active]": true } };

	it("returns the filter parameters and the sorts in their order, like loadData gets them", () => {
		expect(
			dataGridGetQuery(state, columnsState, (customData) => ({
				active: customData["filter[active]"],
			})),
		).toEqual({
			quickFilter: "müller",
			fieldFilter: { name: makeFilter("contains", "ali") },
			additionalFilters: { active: true },
			sort: [
				{ field: "role", direction: 1 },
				{ field: "age", direction: -1 },
			],
		});
	});
});

describe("dataGridIsCustomDataActionDisabled", () => {
	const makeButton = (
		supportsSelectAll?: boolean,
	): DataGridCustomDataActionButton => ({
		icon: null,
		label: "Act",
		isDisabled: (numSelected) => numSelected === 0,
		supportsSelectAll,
		onClick: () => {},
	});

	it("asks isDisabled while the selection isn't inverted", () => {
		expect(dataGridIsCustomDataActionDisabled(makeButton(), 0, false)).toBe(
			true,
		);
		expect(dataGridIsCustomDataActionDisabled(makeButton(), 2, false)).toBe(
			false,
		);
	});

	it("disables a button without supportsSelectAll while everything is selected", () => {
		expect(dataGridIsCustomDataActionDisabled(makeButton(), 2, true)).toBe(
			true,
		);
	});

	it("asks isDisabled of a button with supportsSelectAll while everything is selected", () => {
		expect(dataGridIsCustomDataActionDisabled(makeButton(true), 2, true)).toBe(
			false,
		);
		expect(dataGridIsCustomDataActionDisabled(makeButton(true), 0, true)).toBe(
			true,
		);
	});
});

describe("dataGridLoadFirstRows", () => {
	const ROWS: DataGridRowData[] = Array.from({ length: 12 }, (_, index) => ({
		id: String(index + 1),
		locked: index % 2 === 0 ? "yes" : "no",
	}));
	const QUERY: DataGridQuery = {
		quickFilter: "q",
		additionalFilters: { a: 1 },
		fieldFilter: {},
		sort: [{ field: "id", direction: 1 }],
	};
	const makeLoadData = (source = ROWS) =>
		vi.fn((params: IDataGridLoadDataParameters) => ({
			rowsTotal: source.length,
			rows: source.slice(
				(params.page - 1) * params.rows,
				params.page * params.rows,
			),
		}));
	/** the grid's rows of the given pages (page size 5) */
	const loaded = (...pages: number[]): Record<number, DataGridRowData> =>
		Object.fromEntries(
			pages.flatMap((page) =>
				ROWS.slice(page * 5, page * 5 + 5).map((row, offset) => [
					page * 5 + offset,
					row,
				]),
			),
		);
	const ids = (rows: DataGridRowData[]) => rows.map((row) => row.id);

	it("takes the loaded pages and loads only the missing ones, with the grid's query", async () => {
		const loadData = makeLoadData();
		const result = await dataGridLoadFirstRows(
			loadData,
			QUERY,
			5,
			loaded(0),
			8,
			undefined,
		);
		expect(ids(result.rows)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8"]);
		expect(loadData).toHaveBeenCalledTimes(1);
		expect(loadData).toHaveBeenCalledWith({ page: 2, rows: 5, ...QUERY });
		// the whole page, in the grid's format
		expect(result.loadedRows).toEqual(
			Object.fromEntries(ROWS.slice(5, 10).map((row, i) => [5 + i, row])),
		);
	});

	it("loads nothing if the grid has loaded the rows", async () => {
		const loadData = makeLoadData();
		const result = await dataGridLoadFirstRows(
			loadData,
			QUERY,
			5,
			loaded(0, 1),
			10,
			undefined,
		);
		expect(ids(result.rows)).toHaveLength(10);
		expect(loadData).not.toHaveBeenCalled();
		expect(result.loadedRows).toEqual({});
	});

	it("stops at the last page if fewer rows match than the limit", async () => {
		const loadData = makeLoadData();
		const result = await dataGridLoadFirstRows(
			loadData,
			QUERY,
			5,
			loaded(0),
			50,
			undefined,
		);
		expect(ids(result.rows)).toEqual(ids(ROWS));
		// pages 2 and 3, page 3 is short
		expect(loadData).toHaveBeenCalledTimes(2);
	});

	it("stops after a full last page at the empty page behind it", async () => {
		const loadData = makeLoadData(ROWS.slice(0, 10));
		const result = await dataGridLoadFirstRows(
			loadData,
			QUERY,
			5,
			{},
			50,
			undefined,
		);
		expect(ids(result.rows)).toHaveLength(10);
		expect(loadData.mock.calls.map(([params]) => params.page)).toEqual([
			1, 2, 3,
		]);
	});

	it("skips the rows canSelectRow refuses and reads on to fill the limit", async () => {
		const loadData = makeLoadData();
		const result = await dataGridLoadFirstRows(
			loadData,
			QUERY,
			5,
			loaded(0),
			4,
			(record) => record.locked === "no",
		);
		expect(ids(result.rows)).toEqual(["2", "4", "6", "8"]);
		expect(loadData).toHaveBeenCalledTimes(1);
	});

	it("selects and loads nothing with a limit of 0", async () => {
		const loadData = makeLoadData();
		const result = await dataGridLoadFirstRows(
			loadData,
			QUERY,
			5,
			{},
			0,
			undefined,
		);
		expect(result.rows).toEqual([]);
		expect(loadData).not.toHaveBeenCalled();
	});

	it("rejects if loadData rejects", async () => {
		const error = new Error("offline");
		await expect(
			dataGridLoadFirstRows(
				() => Promise.reject(error),
				QUERY,
				5,
				loaded(0),
				8,
				undefined,
			),
		).rejects.toBe(error);
	});
});
