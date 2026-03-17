import { describe, it, expect } from "vitest";
import { dataGridPrepareFiltersAndSorts } from "../../src/standalone/DataGrid/CallbackUtil";
import type { IDataGridColumnsState } from "../../src/standalone/DataGrid/DataGrid";
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
