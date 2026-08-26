import { describe, expect, it } from "vitest";
import {
	DATA_GRID_PERSIST_VERSION,
	DataGridPersistentState,
	DataGridPersistentStateLegacy,
	decodePersistedState,
	encodePersistedState,
	mergePersistedState,
	normalizeFilterDef,
	splitPersistedState,
} from "../../src/standalone/DataGrid/PersistFormat";
import {
	getDataGridDefaultColumnsState,
	getDataGridDefaultState,
	type IDataGridColumnDef,
	type IDataGridColumnsState,
	type IDataGridState,
	DataGridSortSetting,
} from "../../src/standalone/DataGrid/DataGrid";
import type { IFilterDef } from "../../src/standalone/DataGrid/Content/FilterEntry";
import { dataGridPrepareFiltersAndSorts } from "../../src/standalone/DataGrid/CallbackUtil";

const col = (
	field: string,
	extra: Partial<IDataGridColumnDef> = {},
): IDataGridColumnDef => ({
	field,
	headerName: field,
	type: "string",
	...extra,
});

const COLUMNS: IDataGridColumnDef[] = [
	col("id"),
	col("name"),
	col("secret", { hidden: true }),
	col("pinme", { pinned: true }),
];

const filter = (value1: string): IFilterDef => ({
	type: "contains",
	value1,
	value2: "",
});

const defaults = (
	columns = COLUMNS,
	defaultSort?: DataGridSortSetting[],
	defaultFilter?: Parameters<typeof getDataGridDefaultColumnsState>[2],
) => getDataGridDefaultColumnsState(columns, defaultSort, defaultFilter);

const encode = (
	state: Partial<IDataGridState>,
	columnState: IDataGridColumnsState = defaults(),
	{
		columns = COLUMNS,
		width = {},
		defaultColumnState = defaults(),
		config = undefined as DataGridPersistentState extends never
			? never
			: Parameters<typeof encodePersistedState>[5],
	} = {},
) =>
	encodePersistedState(
		{ ...getDataGridDefaultState(columns, undefined), ...state },
		columnState,
		width,
		defaultColumnState,
		columns,
		config,
	);

describe("normalizeFilterDef", () => {
	it("drops filters without a value", () => {
		expect(normalizeFilterDef(filter(""))).toBeUndefined();
		expect(normalizeFilterDef(null)).toBeUndefined();
		expect(normalizeFilterDef(undefined)).toBeUndefined();
	});

	it("keeps filters with a value untouched", () => {
		const def = filter("abc");
		expect(normalizeFilterDef(def)).toBe(def);
	});

	it("truncates the chain at the first valueless entry", () => {
		const def: IFilterDef = {
			...filter("abc"),
			nextFilter: { ...filter(""), nextFilter: filter("xyz") },
		};
		expect(normalizeFilterDef(def)).toEqual({ ...filter("abc") });
	});
});

describe("encodePersistedState", () => {
	it("partitions the known columns into shown and hidden", () => {
		const data = encode({});
		expect(data.v).toBe(DATA_GRID_PERSIST_VERSION);
		expect(data.shown).toEqual(["id", "name", "pinme"]);
		expect(data.hidden).toEqual(["secret"]);
		expect(data.pinned).toEqual(["pinme"]);
	});

	it("writes nothing for columns which sit at their defaults", () => {
		const data = encode({});
		expect(data.sort).toBeUndefined();
		expect(data.filter).toBeUndefined();
		expect(data.search).toBeUndefined();
	});

	it("only writes sort and filter deviations", () => {
		const columnState: IDataGridColumnsState = {
			...defaults(),
			name: { sort: -1, sortOrder: 1, filter: undefined },
			id: { sort: 0, sortOrder: undefined, filter: filter("42") },
		};
		const data = encode({}, columnState);
		expect(data.sort).toEqual({ name: [-1, 1] });
		expect(data.filter).toEqual({ id: filter("42") });
	});

	it("drops filters which carry no value", () => {
		const columnState: IDataGridColumnsState = {
			...defaults(),
			name: { sort: 0, sortOrder: undefined, filter: filter("") },
		};
		expect(encode({}, columnState).filter).toBeUndefined();
	});

	it("records a cleared default sort so it stays cleared", () => {
		const defaultSort: DataGridSortSetting[] = [
			{ field: "name", direction: 1 },
		];
		const defaultColumnState = defaults(COLUMNS, defaultSort);
		const columnState: IDataGridColumnsState = {
			...defaultColumnState,
			name: { sort: 0, sortOrder: 1, filter: undefined },
		};
		const data = encodePersistedState(
			getDataGridDefaultState(COLUMNS, undefined),
			columnState,
			{},
			defaultColumnState,
			COLUMNS,
			undefined,
		);
		expect(data.sort).toEqual({ name: [0] });
	});

	it("records a cleared default filter as null", () => {
		const defaultFilter = [{ field: "name", filter: filter("preset") }];
		const defaultColumnState = defaults(COLUMNS, undefined, defaultFilter);
		const columnState: IDataGridColumnsState = {
			...defaultColumnState,
			name: { sort: 0, sortOrder: undefined, filter: undefined },
		};
		const data = encodePersistedState(
			getDataGridDefaultState(COLUMNS, undefined),
			columnState,
			{},
			defaultColumnState,
			COLUMNS,
			undefined,
		);
		expect(data.filter).toEqual({ name: null });
	});

	it("leaves forced pins out, they come from the column definition", () => {
		const columns = [col("a"), col("forced", { forcePin: true })];
		const data = encodePersistedState(
			getDataGridDefaultState(columns, undefined),
			defaults(columns),
			{},
			defaults(columns),
			columns,
			undefined,
		);
		expect(data.pinned).toBeUndefined();
	});

	it("rounds column widths to whole pixels", () => {
		const data = encode({}, defaults(), { width: { id: 287.34375 } });
		expect(data.width).toEqual({ id: 287 });
	});

	it("honors the persist config", () => {
		const columnState: IDataGridColumnsState = {
			...defaults(),
			name: { sort: -1, sortOrder: 1, filter: filter("x") },
		};
		const state = { search: "abc", customData: { a: 1 } };
		const onlyColumns = encode({ ...state }, columnState, {
			config: ["columns"],
		});
		expect(onlyColumns.shown).toBeDefined();
		expect(onlyColumns.sort).toBeUndefined();
		expect(onlyColumns.filter).toBeUndefined();
		expect(onlyColumns.search).toBeUndefined();
		expect(onlyColumns.customData).toBeUndefined();

		const onlySort = encode({ ...state }, columnState, { config: ["sort"] });
		expect(onlySort.shown).toBeUndefined();
		expect(onlySort.width).toBeUndefined();
		expect(onlySort.sort).toEqual({ name: [-1, 1] });
		expect(onlySort.filter).toBeUndefined();
	});
});

describe("decodePersistedState", () => {
	it("falls back to the column definitions without persisted data", () => {
		const decoded = decodePersistedState(
			undefined,
			COLUMNS,
			defaults(),
			undefined,
		);
		expect(decoded.state.columnHidden).toEqual({
			id: false,
			name: false,
			secret: true,
			pinme: false,
		});
		expect(decoded.state.columnPinned).toEqual({
			id: false,
			name: false,
			secret: false,
			pinme: true,
		});
	});

	it("round trips the encoded state", () => {
		const state = {
			columnHidden: { id: false, name: true, secret: false, pinme: false },
			columnPinned: { id: true, name: false, secret: false, pinme: false },
			search: "needle",
			customData: { "filter[status]": "active" },
		};
		const encoded = encode(state, defaults(), { width: { id: 120 } });
		const decoded = decodePersistedState(
			encoded,
			COLUMNS,
			defaults(),
			undefined,
		);
		expect(decoded.state.columnHidden).toEqual(state.columnHidden);
		expect(decoded.state.columnPinned).toEqual(state.columnPinned);
		expect(decoded.state.search).toBe("needle");
		expect(decoded.state.customData).toEqual(state.customData);
		expect(decoded.columnWidth).toEqual({ id: 120 });
	});

	it("applies the column definition defaults to columns the user never saw", () => {
		const persisted: DataGridPersistentState = {
			v: DATA_GRID_PERSIST_VERSION,
			shown: ["id", "name"],
			hidden: [],
		};
		const decoded = decodePersistedState(
			persisted,
			COLUMNS,
			defaults(),
			undefined,
		);
		// known columns keep what the user picked
		expect(decoded.state.columnHidden.id).toBe(false);
		expect(decoded.state.columnHidden.name).toBe(false);
		// new columns follow their definition
		expect(decoded.state.columnHidden.secret).toBe(true);
		expect(decoded.state.columnPinned.pinme).toBe(true);
	});

	it("keeps a column the user unhid visible", () => {
		const persisted: DataGridPersistentState = {
			v: DATA_GRID_PERSIST_VERSION,
			shown: ["id", "name", "secret", "pinme"],
			hidden: [],
		};
		const decoded = decodePersistedState(
			persisted,
			COLUMNS,
			defaults(),
			undefined,
		);
		expect(decoded.state.columnHidden.secret).toBe(false);
		expect(decoded.state.columnPinned.pinme).toBe(false);
	});

	it("keeps columns which are not currently defined known", () => {
		const persisted: DataGridPersistentState = {
			v: DATA_GRID_PERSIST_VERSION,
			shown: ["id"],
			hidden: ["name", "gated"],
			pinned: ["gated"],
		};
		const decoded = decodePersistedState(
			persisted,
			COLUMNS,
			defaults(),
			undefined,
		);
		expect(decoded.state.columnHidden.gated).toBe(true);
		expect(decoded.state.columnPinned.gated).toBe(true);
		// and they survive the next write, so the column stays known
		const encoded = encodePersistedState(
			{
				...getDataGridDefaultState(COLUMNS, undefined),
				...decoded.state,
			},
			defaults(),
			{},
			defaults(),
			COLUMNS,
			undefined,
		);
		expect(encoded.hidden).toContain("gated");
		expect(encoded.pinned).toContain("gated");
	});

	it("always pins forced columns, whatever was persisted", () => {
		const columns = [col("a"), col("forced", { forcePin: true })];
		const persisted: DataGridPersistentState = {
			v: DATA_GRID_PERSIST_VERSION,
			shown: ["a", "forced"],
			pinned: [],
		};
		const decoded = decodePersistedState(
			persisted,
			columns,
			defaults(columns),
			undefined,
		);
		expect(decoded.state.columnPinned.forced).toBe(true);
	});

	it("keeps a cleared default sort cleared", () => {
		const defaultSort: DataGridSortSetting[] = [
			{ field: "name", direction: 1 },
		];
		const defaultColumnState = defaults(COLUMNS, defaultSort);
		expect(defaultColumnState.name.sort).toBe(1);
		const decoded = decodePersistedState(
			{ v: DATA_GRID_PERSIST_VERSION, sort: { name: [0] } },
			COLUMNS,
			defaultColumnState,
			undefined,
		);
		expect(decoded.columnState.name.sort).toBe(0);
		expect(decoded.columnState.name.sortOrder).toBeUndefined();
	});

	it("keeps a cleared default filter cleared", () => {
		const defaultFilter = [{ field: "name", filter: filter("preset") }];
		const defaultColumnState = defaults(COLUMNS, undefined, defaultFilter);
		expect(defaultColumnState.name.filter).toBeDefined();
		const decoded = decodePersistedState(
			{ v: DATA_GRID_PERSIST_VERSION, filter: { name: null } },
			COLUMNS,
			defaultColumnState,
			undefined,
		);
		expect(decoded.columnState.name.filter).toBeUndefined();
	});

	it("drops sort and filter of columns which no longer exist", () => {
		const decoded = decodePersistedState(
			{
				v: DATA_GRID_PERSIST_VERSION,
				sort: { gone: [1, 1] },
				filter: { gone: filter("x") },
			},
			COLUMNS,
			defaults(),
			undefined,
		);
		expect(decoded.columnState.gone).toBeUndefined();
	});

	it("does not alias the default column state it was handed", () => {
		const defaultColumnState = defaults(COLUMNS, undefined, [
			{ field: "name", filter: filter("preset") },
		]);
		const decoded = decodePersistedState(
			{ v: DATA_GRID_PERSIST_VERSION, shown: ["id"] },
			COLUMNS,
			defaultColumnState,
			undefined,
		);
		// DataGrid's overrideFilter handling mutates these entries in place
		decoded.columnState.name.filter = undefined;
		expect(defaultColumnState.name.filter).toEqual(filter("preset"));
	});

	it("honors the persist config", () => {
		const persisted: DataGridPersistentState = {
			v: DATA_GRID_PERSIST_VERSION,
			shown: ["id", "name", "secret", "pinme"],
			sort: { name: [-1, 1] },
			filter: { id: filter("x") },
			search: "needle",
			width: { id: 120 },
		};
		const decoded = decodePersistedState(persisted, COLUMNS, defaults(), [
			"sort",
		]);
		expect(decoded.state.columnHidden.secret).toBe(true);
		expect(decoded.columnWidth).toEqual({});
		expect(decoded.state.search).toBeUndefined();
		expect(decoded.columnState.name.sort).toBe(-1);
		expect(decoded.columnState.id.filter).toBeUndefined();
	});
});

describe("decodePersistedState (legacy format)", () => {
	const LEGACY: DataGridPersistentStateLegacy = {
		columnState: {
			id: { sort: 0, sortOrder: 1, filter: filter("") },
			name: { sort: 0, filter: null } as never,
			secret: { sort: 0, filter: undefined },
			gone: { sort: 0, filter: undefined },
		},
		state: {
			search: "",
			hiddenColumns: ["name", "gone"],
			lockedColumns: [],
			customData: { "filter[status]": "active" },
		},
	};

	it("migrates the visibility arrays", () => {
		const decoded = decodePersistedState(
			LEGACY,
			COLUMNS,
			defaults(),
			undefined,
		);
		expect(decoded.state.columnHidden).toEqual({
			id: false,
			// hidden by default, but the user had it visible
			secret: false,
			name: true,
			gone: true,
			// not in the legacy data at all -> follows its definition
			pinme: false,
		});
		expect(decoded.state.columnPinned.pinme).toBe(true);
	});

	it("treats a column missing from the legacy data as new", () => {
		const decoded = decodePersistedState(
			LEGACY,
			[...COLUMNS, col("added", { hidden: true, pinned: true })],
			defaults([...COLUMNS, col("added", { hidden: true, pinned: true })]),
			undefined,
		);
		expect(decoded.state.columnHidden.added).toBe(true);
		expect(decoded.state.columnPinned.added).toBe(true);
	});

	it("drops the legacy no-op sort and filter entries", () => {
		const decoded = decodePersistedState(
			LEGACY,
			COLUMNS,
			defaults(),
			undefined,
		);
		expect(decoded.columnState.id.sort).toBe(0);
		expect(decoded.columnState.id.filter).toBeUndefined();
		expect(decoded.state.customData).toEqual({ "filter[status]": "active" });
	});

	it("keeps a default sort the user had cleared", () => {
		const defaultSort: DataGridSortSetting[] = [{ field: "id", direction: 1 }];
		const defaultColumnState = defaults(COLUMNS, defaultSort);
		const decoded = decodePersistedState(
			LEGACY,
			COLUMNS,
			defaultColumnState,
			undefined,
		);
		expect(decoded.columnState.id.sort).toBe(0);
	});

	it("leaves visibility to the defaults when the legacy data carries none", () => {
		const decoded = decodePersistedState(
			{ columnState: LEGACY.columnState, state: { search: "x" } },
			COLUMNS,
			defaults(),
			undefined,
		);
		expect(decoded.state.columnHidden.secret).toBe(true);
		expect(decoded.state.search).toBe("x");
	});

	it("never hides columns retroactively when it learned nothing", () => {
		const decoded = decodePersistedState(
			{ columnState: {}, state: { hiddenColumns: [], lockedColumns: [] } },
			COLUMNS,
			defaults(),
			undefined,
		);
		expect(decoded.state.columnHidden.secret).toBe(true);
	});

	it("shrinks a real world payload by more than half", () => {
		// shaped like a samedis-care device grid: 72 columns, 59 of them hidden
		const fields = Array.from({ length: 72 }, (_, i) => `column_number_${i}`);
		const hiddenColumns = fields.slice(13);
		const legacy: DataGridPersistentStateLegacy = {
			columnState: Object.fromEntries(
				fields.map((field) => [field, { sort: 0, filter: undefined }]),
			),
			state: {
				search: "",
				hiddenColumns,
				lockedColumns: [],
				customData: { "filter[status]": "active" },
			},
		};
		const columns = fields.map((field) => col(field));
		const decoded = decodePersistedState(
			legacy,
			columns,
			defaults(columns),
			undefined,
		);
		const encoded = encodePersistedState(
			{
				...getDataGridDefaultState(columns, undefined),
				...decoded.state,
			},
			decoded.columnState,
			decoded.columnWidth,
			defaults(columns),
			columns,
			undefined,
		);
		const before = JSON.stringify(legacy).length;
		const after = JSON.stringify(encoded).length;
		expect(after).toBeLessThan(before * 0.5);
		// and nothing was lost on the way
		expect(encoded.hidden).toEqual(hiddenColumns);
		expect(encoded.shown).toEqual(fields.slice(0, 13));
	});
});

describe("splitPersistedState / mergePersistedState", () => {
	it("splits sizing off and merges it back", () => {
		const data: DataGridPersistentState = {
			v: DATA_GRID_PERSIST_VERSION,
			shown: ["id"],
			width: { id: 120 },
			initialResize: true,
			search: "x",
		};
		const [sizing, rest] = splitPersistedState(data);
		expect(sizing).toEqual({
			v: DATA_GRID_PERSIST_VERSION,
			width: { id: 120 },
			initialResize: true,
		});
		expect(rest.width).toBeUndefined();
		expect(mergePersistedState([sizing, rest])).toEqual(data);
	});

	it("keeps both halves of legacy data which nested them under state", () => {
		const merged = mergePersistedState([
			{ columnWidth: { id: 1 }, state: { initialResize: true } },
			{ columnState: {}, state: { search: "x" } },
		]) as DataGridPersistentStateLegacy;
		expect(merged.state).toEqual({ initialResize: true, search: "x" });
		expect(merged.columnWidth).toEqual({ id: 1 });
	});

	it("returns undefined when there is nothing stored", () => {
		expect(mergePersistedState([undefined, undefined])).toBeUndefined();
	});
});

describe("decodePersistedState (hostile input)", () => {
	// persisted data lives in a user's storage, so it may have been written by an
	// older version, hand edited, truncated, or be plain nonsense
	const CASES: [string, unknown][] = [
		["null", null],
		["primitive string", "nonsense"],
		["primitive number", 42],
		["primitive bool", true],
		["array", [1, 2, 3]],
		["empty object", {}],
		["v as string", { v: "2" }],
		["shown string", { v: 2, shown: "id" }],
		["shown number", { v: 2, shown: 5, hidden: ["id"] }],
		["shown object", { v: 2, shown: { a: 1 }, hidden: ["id"] }],
		["shown faking a length", { v: 2, shown: { length: 2 }, hidden: ["id"] }],
		["shown with holes", { v: 2, shown: ["id", null, 7, undefined] }],
		["hidden number", { v: 2, shown: ["id"], hidden: 7 }],
		["pinned object", { v: 2, shown: ["id"], pinned: { id: true } }],
		["pinned string", { v: 2, shown: ["id"], pinned: "id" }],
		["sort scalar", { v: 2, sort: { name: 1 } }],
		["sort null", { v: 2, sort: { name: null } }],
		["sort string", { v: 2, sort: { name: "asc" } }],
		["sort object", { v: 2, sort: { name: { dir: 1 } } }],
		["sort empty array", { v: 2, sort: { name: [] } }],
		["sort bad direction", { v: 2, sort: { name: [5, 1] } }],
		["sort bad order", { v: 2, sort: { name: [1, "first"] } }],
		["sort not an object", { v: 2, sort: 5 }],
		["filter scalar", { v: 2, filter: { name: 5 } }],
		["filter without value1", { v: 2, filter: { name: { type: "equals" } } }],
		[
			"filter with number value1",
			{ v: 2, filter: { name: { type: "e", value1: 5 } } },
		],
		["filter not an object", { v: 2, filter: "x" }],
		["width string", { v: 2, width: "abc" }],
		["width not numeric", { v: 2, width: { id: "wide" } }],
		["width negative", { v: 2, width: { id: -5 } }],
		["width NaN", { v: 2, width: { id: Number.NaN } }],
		["search object", { v: 2, search: { a: 1 } }],
		["customData string", { v: 2, customData: "nope" }],
		["initialResize string", { v: 2, initialResize: "yes" }],
		["legacy columnState string", { columnState: "abc" }],
		["legacy columnState number", { columnState: 5 }],
		["legacy entry scalar", { columnState: { id: 5 } }],
		["legacy entry null", { columnState: { id: null } }],
		["legacy state string", { state: "abc" }],
		["legacy hidden number", { state: { hiddenColumns: 5 } }],
		["legacy hidden object", { state: { hiddenColumns: { a: 1 } } }],
		["legacy hidden string", { state: { hiddenColumns: "id" } }],
		["legacy locked object", { state: { lockedColumns: { a: 1 } } }],
		[
			"legacy locked number",
			{ state: { hiddenColumns: [], lockedColumns: 5 } },
		],
		[
			"legacy width string",
			{ columnWidth: "abc", state: { hiddenColumns: [] } },
		],
		["legacy filter scalar", { columnState: { id: { sort: 0, filter: 5 } } }],
		[
			"runaway filter chain",
			(() => {
				let f: Record<string, unknown> = {
					type: "equals",
					value1: "x",
					value2: "",
				};
				for (let i = 0; i < 20000; i++)
					f = { type: "equals", value1: "x", value2: "", nextFilter: f };
				return { columnState: { id: { sort: 0, filter: f } } };
			})(),
		],
	];

	const FIELDS = COLUMNS.map((column) => column.field);

	it.each(CASES)("survives %s", (_name, payload) => {
		const decoded = decodePersistedState(
			payload as never,
			COLUMNS,
			defaults(),
			undefined,
		);

		// every current column has a usable visibility and pin state
		for (const field of FIELDS) {
			expect(typeof decoded.state.columnHidden[field]).toBe("boolean");
			expect(typeof decoded.state.columnPinned[field]).toBe("boolean");
		}
		for (const value of Object.values(decoded.state.columnHidden))
			expect(typeof value).toBe("boolean");
		for (const value of Object.values(decoded.state.columnPinned))
			expect(typeof value).toBe("boolean");

		// every column has a column state and no sort the grid can't render
		for (const field of FIELDS) {
			expect(decoded.columnState[field]).toBeDefined();
			expect([-1, 0, 1]).toContain(decoded.columnState[field].sort);
		}

		// widths that would end up as NaN in the layout maths are dropped
		for (const width of Object.values(decoded.columnWidth)) {
			expect(Number.isFinite(width)).toBe(true);
			expect(width).toBeGreaterThan(0);
		}

		expect(["string", "undefined"]).toContain(typeof decoded.state.search);
		if (decoded.state.customData !== undefined)
			expect(decoded.state.customData).toBeTypeOf("object");
		expect(["boolean", "undefined"]).toContain(
			typeof decoded.state.initialResize,
		);

		// nothing bogus reaches the backend query
		const [sorts, filters] = dataGridPrepareFiltersAndSorts(
			decoded.columnState,
		);
		for (const sort of sorts) expect(FIELDS).toContain(sort.field);
		for (const field of Object.keys(filters)) expect(FIELDS).toContain(field);

		// and what we write back is clean, serializable, and decodes to the same
		const encoded = encodePersistedState(
			{
				...getDataGridDefaultState(COLUMNS, undefined),
				...decoded.state,
			},
			decoded.columnState,
			decoded.columnWidth,
			defaults(),
			COLUMNS,
			undefined,
		);
		const roundTripped = decodePersistedState(
			JSON.parse(JSON.stringify(encoded)) as never,
			COLUMNS,
			defaults(),
			undefined,
		);
		expect(roundTripped.state.columnHidden).toEqual(decoded.state.columnHidden);
		expect(roundTripped.state.columnPinned).toEqual(decoded.state.columnPinned);
		expect(roundTripped.columnState).toEqual(decoded.columnState);
	});
});

describe("persistence robustness backstop", () => {
	it("falls back to the defaults when decoding throws outright", () => {
		// a provider does not have to hand us the output of JSON.parse
		const payload = { v: 2 };
		Object.defineProperty(payload, "shown", {
			get() {
				throw new Error("boom");
			},
			enumerable: true,
		});
		const decoded = decodePersistedState(
			payload,
			COLUMNS,
			defaults(),
			undefined,
		);
		expect(decoded.state.columnHidden).toEqual({
			id: false,
			name: false,
			secret: true,
			pinme: false,
		});
	});

	it("keeps a filter whose type is null, which FilterType allows", () => {
		const persisted = {
			v: DATA_GRID_PERSIST_VERSION,
			filter: { name: { type: null, value1: "x", value2: "" } },
		};
		const decoded = decodePersistedState(
			persisted as never,
			COLUMNS,
			defaults(),
			undefined,
		);
		expect(decoded.columnState.name.filter).toEqual({
			type: null,
			value1: "x",
			value2: "",
			nextFilter: undefined,
		});
	});

	it("merges gibberish parts without throwing", () => {
		const parts: unknown[] = [
			"nonsense",
			42,
			true,
			[1, 2],
			null,
			undefined,
			{ v: 2, width: { id: 1 } },
			{ state: "abc" },
			{ state: { search: "x" } },
		];
		for (const a of parts) {
			for (const b of parts) {
				const merged = mergePersistedState([a as never, b as never]);
				expect(() =>
					decodePersistedState(merged, COLUMNS, defaults(), undefined),
				).not.toThrow();
			}
		}
	});

	it("splits and merges back without losing anything", () => {
		const encoded = encode(
			{ columnHidden: { id: true }, columnPinned: {}, search: "x" },
			defaults(),
			{ width: { id: 120.6 } },
		);
		expect(mergePersistedState(splitPersistedState(encoded))).toEqual(encoded);
	});
});
