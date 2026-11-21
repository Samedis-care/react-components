import { describe, it, expect } from "vitest";
import filterSortPaginate from "../../src/utils/filterSortPaginate";
import type { IFilterDef } from "../../src/standalone/DataGrid/Content/FilterEntry";
import type {
	DataGridRowData,
	IDataGridColumnDef,
} from "../../src/standalone/DataGrid/DataGrid";

const columns: IDataGridColumnDef[] = [
	{ field: "name", headerName: "Name", type: "string" },
];

const rows = (): DataGridRowData[] =>
	["apple", "banana", "cherry", "kiwi", ""].map((name, index) => ({
		id: index.toString(),
		name,
	}));

/** The names of the rows that pass the given filter on the name column */
const namesFor = (filter: IFilterDef): string[] =>
	filterSortPaginate(
		rows(),
		{
			page: 1,
			rows: 100,
			quickFilter: "",
			additionalFilters: {},
			fieldFilter: { name: filter },
			sort: [],
		},
		columns,
	)[0].map((row) => row.name as string);

describe("filterSortPaginate", () => {
	describe("field filter", () => {
		it("[ISSUE-3494-ITEM-36] an empty chained condition ends the chain: the conditions before it still filter", () => {
			expect(
				namesFor({
					type: "contains",
					value1: "a",
					value2: "",
					nextFilterType: "and",
					nextFilter: { type: "contains", value1: "", value2: "" },
				}),
			).toEqual(["apple", "banana"]);
			expect(
				namesFor({
					type: "contains",
					value1: "a",
					value2: "",
					nextFilterType: "or",
					nextFilter: {
						type: "contains",
						value1: "y",
						value2: "",
						nextFilterType: "and",
						nextFilter: { type: "contains", value1: "", value2: "" },
					},
				}),
			).toEqual(["apple", "banana", "cherry"]);
		});

		it("[ISSUE-3494-ITEM-36] the conditions after an empty one are ignored, as in the DataGrid's query", () => {
			expect(
				namesFor({
					type: "contains",
					value1: "a",
					value2: "",
					nextFilterType: "and",
					nextFilter: {
						type: "contains",
						value1: "",
						value2: "",
						nextFilterType: "and",
						nextFilter: { type: "contains", value1: "k", value2: "" },
					},
				}),
			).toEqual(["apple", "banana"]);
		});

		it("[ISSUE-3494-ITEM-36] a filter whose first condition is empty filters nothing", () => {
			const all = ["apple", "banana", "cherry", "kiwi", ""];
			expect(namesFor({ type: "equals", value1: "", value2: "" })).toEqual(all);
			expect(
				namesFor({
					type: "notContains",
					value1: "",
					value2: "",
					nextFilterType: "and",
					nextFilter: { type: "contains", value1: "a", value2: "" },
				}),
			).toEqual(all);
		});

		it("[ISSUE-3494-ITEM-36] an empty or notEmpty condition with its type as value1, as the filter popup sets it, still filters", () => {
			expect(
				namesFor({
					type: "contains",
					value1: "k",
					value2: "",
					nextFilterType: "or",
					nextFilter: { type: "empty", value1: "empty", value2: "" },
				}),
			).toEqual(["kiwi", ""]);
			expect(
				namesFor({ type: "notEmpty", value1: "notEmpty", value2: "" }),
			).toEqual(["apple", "banana", "cherry", "kiwi"]);
		});
	});
});
