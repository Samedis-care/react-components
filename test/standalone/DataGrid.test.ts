import { describe, it, expect } from "vitest";
import {
	dataGridApplyRowUpdate,
	dataGridPrepareFiltersAndSorts,
} from "../../src/standalone/DataGrid/CallbackUtil";
import {
	getDataGridDefaultState,
	type IDataGridColumnsState,
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
