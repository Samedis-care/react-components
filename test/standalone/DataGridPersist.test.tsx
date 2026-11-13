import React, { StrictMode, useContext, useMemo } from "react";
import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
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
	DataGridProps,
	IDataGridColumnDef,
	IDataGridColumnsState,
	IDataGridState,
	useDataGridColumnState,
	useDataGridColumnsWidthState,
	useDataGridState,
} from "../../src/standalone/DataGrid/DataGrid";
import type { IDataGridFilterBarProps } from "../../src/standalone/DataGrid/Header/FilterBar";
import { applyColumnWidthLimits } from "../../src/standalone/DataGrid/Content/ColumnHeader";
import LocalStoragePersist from "../../src/standalone/DataGrid/LocalStoragePersist";
import StorageManagerPersist, {
	DATA_GRID_STORAGE_KEY_COLUMN_SIZING,
	DATA_GRID_STORAGE_KEY_FILTERS,
} from "../../src/standalone/DataGrid/StorageManagerPersist";
import {
	DataGridPersistentStateContext,
	DataGridPersistentStateContextType,
} from "../../src/standalone/DataGrid/StatePersistence";
import {
	DATA_GRID_PERSIST_VERSION,
	DataGridPersistedData,
	DataGridPersistentState,
} from "../../src/standalone/DataGrid/PersistFormat";
import {
	DefaultGetStorageProviderCallback,
	LocalStorageProviderInstance,
	StorageManager,
	StorageProvider,
} from "../../src/framework/Storage";

// MultiGrid renders the cells and reports the rendered rows; the grid tests
// below only need the state the grid restores and writes
vi.mock("../../src/standalone/Virtualized/MultiGrid", () => ({
	default: () => null,
}));

beforeAll(async () => {
	await ccI18n.init();
	await ccI18n.changeLanguage("en");
	// jsdom has neither; MUI's useMediaQuery and the grid's layout need them
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

const theme = createTheme();

const STORED: DataGridPersistentState = {
	v: DATA_GRID_PERSIST_VERSION,
	search: "stored",
};

const WRITTEN: DataGridPersistentState = {
	v: DATA_GRID_PERSIST_VERSION,
	search: "written",
	customData: { "filter[status]": "open" },
};

let write: ((data: DataGridPersistentState) => Promise<void> | void) | null =
	null;

/** Shows what the persistence context provides, and keeps its setter */
const Probe = (props: { testId: string }) => {
	const ctx = useContext(DataGridPersistentStateContext);
	write = ctx?.[1] ?? null;
	const data = ctx?.[0];
	// the tests store the current format only, a legacy one keeps its search in state
	const search = data?.v == null ? undefined : data.search;
	return <span data-testid={props.testId}>{search ?? "none"}</span>;
};

beforeEach(() => {
	localStorage.clear();
	StorageManager.configure(DefaultGetStorageProviderCallback);
	write = null;
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	grid = null;
	localStorage.clear();
	StorageManager.configure(DefaultGetStorageProviderCallback);
});

describe("LocalStoragePersist", () => {
	const renderPersist = (storageKey: string, ui: React.ReactNode) => (
		<LocalStoragePersist storageKey={storageKey}>{ui}</LocalStoragePersist>
	);

	it("provides what was stored before", () => {
		localStorage.setItem("grid", JSON.stringify(STORED));
		render(renderPersist("grid", <Probe testId={"a"} />));
		expect(screen.getByTestId("a")).toHaveTextContent("stored");
	});

	it("provides what was written last and stores it", () => {
		localStorage.setItem("grid", JSON.stringify(STORED));
		const { rerender } = render(renderPersist("grid", <Probe testId={"a"} />));
		act(() => void write!(WRITTEN));
		expect(screen.getByTestId("a")).toHaveTextContent("written");
		expect(JSON.parse(localStorage.getItem("grid")!)).toEqual(WRITTEN);

		// a grid mounted after the write starts from it
		rerender(
			renderPersist(
				"grid",
				<>
					<Probe testId={"a"} />
					<Probe testId={"b"} />
				</>,
			),
		);
		expect(screen.getByTestId("b")).toHaveTextContent("written");
	});

	it("provides another key's own data", () => {
		localStorage.setItem("other", JSON.stringify(STORED));
		const { rerender } = render(renderPersist("grid", <Probe testId={"a"} />));
		act(() => void write!(WRITTEN));
		rerender(renderPersist("other", <Probe testId={"a"} />));
		expect(screen.getByTestId("a")).toHaveTextContent("stored");
	});
});

describe("StorageManagerPersist", () => {
	const renderPersist = (
		storageKeys: Record<string, string>,
		ui: React.ReactNode,
	) => (
		<ThemeProvider theme={theme}>
			<StorageManagerPersist storageKeys={storageKeys}>
				{ui}
			</StorageManagerPersist>
		</ThemeProvider>
	);

	it("provides what was stored before", async () => {
		await StorageManager.setItem(
			DATA_GRID_STORAGE_KEY_FILTERS,
			{ grid: "a" },
			JSON.stringify(STORED),
		);
		render(renderPersist({ grid: "a" }, <Probe testId={"a"} />));
		expect(await screen.findByTestId("a")).toHaveTextContent("stored");
	});

	it("provides what was written last and stores it", async () => {
		const { rerender } = render(
			renderPersist({ grid: "a" }, <Probe testId={"a"} />),
		);
		expect(await screen.findByTestId("a")).toHaveTextContent("none");
		await act(async () => {
			await write!(WRITTEN);
		});
		expect(screen.getByTestId("a")).toHaveTextContent("written");
		expect(
			JSON.parse(
				StorageManager.getItem(DATA_GRID_STORAGE_KEY_FILTERS, {
					grid: "a",
				}) as string,
			),
		).toMatchObject({ search: "written", customData: WRITTEN.customData });

		// a grid mounted after the write starts from it
		rerender(
			renderPersist(
				{ grid: "a" },
				<>
					<Probe testId={"a"} />
					<Probe testId={"b"} />
				</>,
			),
		);
		expect(screen.getByTestId("b")).toHaveTextContent("written");
	});

	it("provides other keys' own data", async () => {
		await StorageManager.setItem(
			DATA_GRID_STORAGE_KEY_FILTERS,
			{ grid: "b" },
			JSON.stringify(STORED),
		);
		const { rerender } = render(
			renderPersist({ grid: "a" }, <Probe testId={"a"} />),
		);
		await screen.findByTestId("a");
		await act(async () => {
			await write!(WRITTEN);
		});
		rerender(renderPersist({ grid: "b" }, <Probe testId={"a"} />));
		await waitFor(() =>
			expect(screen.getByTestId("a")).toHaveTextContent("stored"),
		);
	});
});

// ─── Grids under a provider ──────────────────────────────────────────────────

const GRID_COLUMNS: IDataGridColumnDef[] = [
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
	{ field: "secret", headerName: "Secret", type: "string", hidden: true },
];

const noRows = (): DataGridData => ({ rowsTotal: 0, rows: [] });

type GridProbe = {
	state: IDataGridState;
	setState: React.Dispatch<React.SetStateAction<IDataGridState>>;
	columnState: IDataGridColumnsState;
	setColumnState: React.Dispatch<React.SetStateAction<IDataGridColumnsState>>;
	widths: Record<string, number>;
	setWidths: React.Dispatch<React.SetStateAction<Record<string, number>>>;
};

let grid: GridProbe | null = null;

/**
 * A filter bar renders inside the grid's providers, so it reads and drives
 * the grid's state through the exported hooks, as app filter bars do
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProbeBar = React.memo(function ProbeBar(_p: IDataGridFilterBarProps) {
	const [state, setState] = useDataGridState();
	const [columnState, setColumnState] = useDataGridColumnState();
	const [widths, setWidths] = useDataGridColumnsWidthState();
	grid = { state, setState, columnState, setColumnState, widths, setWidths };
	return null;
});

const Grid = (props: Partial<DataGridProps>) => (
	<ThemeProvider theme={theme}>
		<DataGrid
			columns={GRID_COLUMNS}
			loadData={noRows}
			filterBar={ProbeBar}
			{...props}
		/>
	</ThemeProvider>
);

/** the grid has mounted and no load is running or queued */
const gridIdle = () =>
	waitFor(() => expect(grid?.state.refreshData).toBe(0), { timeout: 3000 });

/** A provider handing out the given data, with a stable context value */
const ValueProvider = (props: {
	stored: DataGridPersistedData | undefined;
	save: DataGridPersistentStateContextType[1];
	children: React.ReactNode;
}) => {
	const { stored, save, children } = props;
	const ctx = useMemo(
		(): DataGridPersistentStateContextType => [stored, save],
		[stored, save],
	);
	return (
		<DataGridPersistentStateContext.Provider value={ctx}>
			{children}
		</DataGridPersistentStateContext.Provider>
	);
};

/** An in-memory storage (a "server") which records its writes */
class MemoryProvider extends StorageProvider {
	data: Record<string, string> = {};
	writes: [key: string, value: string | null][] = [];
	getItem(key: string): Promise<string | null> {
		return Promise.resolve(this.data[key] ?? null);
	}
	setItem(key: string, value: string | null): Promise<void> {
		this.writes.push([key, value]);
		if (value == null) delete this.data[key];
		else this.data[key] = value;
		return Promise.resolve();
	}
	clear() {
		this.data = {};
	}
}

/** The key StorageManager stores a bucket under */
const keyOf = (id: string, keys: Record<string, string>) =>
	id + "-" + JSON.stringify(keys);

const SIZING = DATA_GRID_STORAGE_KEY_COLUMN_SIZING;

const FILTERS = DATA_GRID_STORAGE_KEY_FILTERS;

/** A stored bucket or entry */
const persisted = (value: string | null | undefined) =>
	JSON.parse(value ?? "null") as DataGridPersistentState;

/** Routes the buckets like samedis.care: filters to the server, sizing local and across tenants */
const configureLikeSamedis = (server: MemoryProvider) =>
	StorageManager.configure((id, keys) => {
		if (id === FILTERS) return [server, keys];
		delete keys["tenant"];
		return [LocalStorageProviderInstance, keys];
	});

/** Where LocalStorageProviderInstance keeps a bucket */
const localKeyOf = (id: string, keys: Record<string, string>) =>
	"cc-lsp-" + keyOf(id, keys);

describe("persistence provider bugs", () => {
	const smp = (keys: Record<string, string>, child = <Grid />) => (
		<ThemeProvider theme={theme}>
			<StorageManagerPersist storageKeys={keys}>{child}</StorageManagerPersist>
		</ThemeProvider>
	);
	it("[ISSUE-3496-ITEM-5] LocalStoragePersist does not write the previous key's grid state into a new storageKey", async () => {
		localStorage.setItem(
			"grid-B",
			JSON.stringify({
				v: 2,
				search: "B's search",
				shown: ["name", "role"],
				hidden: ["secret"],
			}),
		);
		const ui = (storageKey: string) => (
			<LocalStoragePersist storageKey={storageKey}>
				<Grid />
			</LocalStoragePersist>
		);
		const { rerender } = render(ui("grid-A"));
		await gridIdle();
		act(() => grid!.setState((prev) => ({ ...prev, search: "A's search" })));
		rerender(ui("grid-B"));
		act(() =>
			grid!.setState((prev) => ({
				...prev,
				columnHidden: { ...prev.columnHidden, role: true },
			})),
		);
		expect(persisted(localStorage.getItem("grid-B")).search).toBe("B's search");
	});
	it("[ISSUE-3496-ITEM-5] after a storageKey change the grid shows what is stored under the new key, and back", async () => {
		localStorage.setItem(
			"grid-B",
			JSON.stringify({
				v: 2,
				search: "B's search",
				shown: ["name", "secret"],
				hidden: ["role"],
			}),
		);
		const ui = (storageKey: string) => (
			<LocalStoragePersist storageKey={storageKey}>
				<Grid />
			</LocalStoragePersist>
		);
		const { rerender } = render(ui("grid-A"));
		await gridIdle();
		act(() => grid!.setState((prev) => ({ ...prev, search: "A's search" })));

		grid = null;
		rerender(ui("grid-B"));
		await gridIdle();
		expect(grid!.state.search).toBe("B's search");
		expect(grid!.state.columnHidden).toMatchObject({
			role: true,
			secret: false,
		});
		// switching keys writes neither
		expect(persisted(localStorage.getItem("grid-B")).search).toBe("B's search");

		grid = null;
		rerender(ui("grid-A"));
		await gridIdle();
		expect(grid!.state.search).toBe("A's search");
		expect(grid!.state.columnHidden).toMatchObject({
			role: false,
			secret: true,
		});
		expect(persisted(localStorage.getItem("grid-A")).search).toBe("A's search");
	});
	it("[ISSUE-3496-ITEM-6] a grid that opens on what is stored does not write it again", async () => {
		const first = vi.fn<DataGridPersistentStateContextType[1]>();
		render(
			<ValueProvider stored={undefined} save={first}>
				<Grid />
			</ValueProvider>,
		);
		await gridIdle();
		act(() => grid!.setState((prev) => ({ ...prev, search: "s" })));
		const stored = JSON.parse(
			JSON.stringify(first.mock.lastCall![0]),
		) as DataGridPersistentState;
		cleanup();
		grid = null;

		const second = vi.fn<DataGridPersistentStateContextType[1]>();
		render(
			<ValueProvider stored={stored} save={second}>
				<Grid />
			</ValueProvider>,
		);
		await gridIdle();
		expect(grid!.state.search).toBe("s");
		expect(second).not.toHaveBeenCalled();
	});
	it("[ISSUE-3496-ITEM-6] a grid that opens on both StorageManagerPersist buckets writes neither, and writes its first change", async () => {
		const server = new MemoryProvider();
		configureLikeSamedis(server);
		const keys = { model: "m", tenant: "t" };
		localStorage.setItem(
			localKeyOf(SIZING, { model: "m" }),
			JSON.stringify({
				v: 2,
				width: { name: 211, role: 222, secret: 233 },
				initialResize: true,
			}),
		);
		server.data[keyOf(FILTERS, keys)] = JSON.stringify({
			v: 2,
			shown: ["name", "role"],
			hidden: ["secret"],
			sort: { role: [1, 1] },
			search: "kept",
			customData: {},
		});
		const local = vi.spyOn(LocalStorageProviderInstance, "setItem");
		render(smp(keys));
		await gridIdle();
		expect(grid!.state.search).toBe("kept");
		expect(server.writes).toEqual([]);
		expect(local).not.toHaveBeenCalled();

		act(() => grid!.setState((prev) => ({ ...prev, search: "typed" })));
		await waitFor(() => expect(server.writes).toHaveLength(1));
		expect(JSON.parse(server.writes[0][1]!)).toMatchObject({
			shown: ["name", "role"],
			hidden: ["secret"],
			sort: [["role", 1]],
			search: "typed",
		});
	});
	it("[ISSUE-3496-ITEM-6] legacy data is written back as v2 on the next state change, not when the grid opens", async () => {
		const legacy = JSON.stringify({
			columnState: {
				name: { sort: 0 },
				role: { sort: 1, sortOrder: 1 },
				secret: { sort: 0 },
			},
			columnWidth: { name: 211, role: 222, secret: 233 },
			state: {
				hiddenColumns: ["secret"],
				lockedColumns: [],
				search: "old",
				initialResize: true,
			},
		});
		localStorage.setItem("legacy", legacy);
		const setItem = vi.spyOn(Storage.prototype, "setItem");
		render(
			<LocalStoragePersist storageKey={"legacy"}>
				<Grid />
			</LocalStoragePersist>,
		);
		await gridIdle();
		expect(grid!.state.search).toBe("old");
		expect(setItem).not.toHaveBeenCalled();
		expect(localStorage.getItem("legacy")).toBe(legacy);

		act(() => grid!.setState((prev) => ({ ...prev, search: "new" })));
		expect(setItem).toHaveBeenCalledTimes(1);
		expect(JSON.parse(localStorage.getItem("legacy")!)).toMatchObject({
			v: DATA_GRID_PERSIST_VERSION,
			shown: ["name", "role"],
			hidden: ["secret"],
			sort: [["role", 1]],
			search: "new",
			width: { name: 211, role: 222, secret: 233 },
			initialResize: true,
		});
	});
	it("[ISSUE-3496-ITEM-6] a visit without a column does not write away that column's stored sort and filter", async () => {
		const save = vi.fn<DataGridPersistentStateContextType[1]>();
		const stored: DataGridPersistentState = {
			v: DATA_GRID_PERSIST_VERSION,
			shown: ["name", "role", "gated"],
			hidden: ["secret"],
			sort: { gated: [-1, 1] },
			filter: { gated: { type: "contains", value1: "x", value2: "" } },
			width: { name: 211, role: 222, secret: 233, gated: 244 },
			initialResize: true,
		};
		render(
			<ValueProvider stored={stored} save={save}>
				<Grid />
			</ValueProvider>,
		);
		await gridIdle();
		expect(grid!.columnState).not.toHaveProperty("gated");
		expect(save).not.toHaveBeenCalled();
	});
	it("[ISSUE-3496-ITEM-6] in StrictMode a grid with nothing stored writes nothing when it opens, and a change once", async () => {
		const save = vi.fn<DataGridPersistentStateContextType[1]>();
		render(
			<StrictMode>
				<ValueProvider stored={undefined} save={save}>
					<Grid />
				</ValueProvider>
			</StrictMode>,
		);
		await gridIdle();
		expect(save).not.toHaveBeenCalled();

		act(() => grid!.setState((prev) => ({ ...prev, search: "q" })));
		expect(save).toHaveBeenCalledTimes(1);
		expect(save.mock.lastCall![0]).toMatchObject({ search: "q" });
	});
	it("[ISSUE-3496-ITEM-1] a tenant's legacy filters bucket survives a visit after another tenant wrote the shared sizing bucket as v2", async () => {
		const server = new MemoryProvider();
		configureLikeSamedis(server);
		const keysT2 = { model: "devices", tenant: "T2" };
		// tenant T1 was opened first after the update: the sizing bucket, which
		// samedis.care shares across tenants, is v2 now
		localStorage.setItem(
			localKeyOf(SIZING, { model: "devices" }),
			JSON.stringify({ v: 2, width: { name: 300 }, initialResize: true }),
		);
		// T2's filters bucket is still in the legacy format
		const legacyFilters = JSON.stringify({
			columnState: {
				name: { sort: 0 },
				role: { sort: 1, sortOrder: 1 },
				secret: { sort: 0 },
			},
			state: {
				search: "needle",
				hiddenColumns: ["name"],
				lockedColumns: [],
				customData: {},
			},
		});
		server.data[keyOf(FILTERS, keysT2)] = legacyFilters;
		render(smp(keysT2));
		await gridIdle();
		expect(grid!.state.search).toBe("needle");
		expect(grid!.state.columnHidden.name).toBe(true);
		expect(grid!.columnState.role.sort).toBe(1);
		// the visit wrote T2's bucket back: whatever format, the search is kept
		const stored = JSON.parse(server.data[keyOf(FILTERS, keysT2)]) as {
			v?: number;
			search?: string;
			state?: { search?: string };
		};
		expect(stored.v == null ? stored.state?.search : stored.search).toBe(
			"needle",
		);
	});
	it("[ISSUE-3496-ITEM-3] StorageManagerPersist renders its children when a bucket cannot be read", async () => {
		const failing = new (class extends MemoryProvider {
			getItem(): Promise<string | null> {
				return Promise.reject(new Error("503"));
			}
		})();
		StorageManager.configure((_id, keys) => [failing, keys]);
		render(smp({ model: "x" }, <span data-testid={"child"} />));
		await waitFor(() =>
			expect(screen.queryByTestId("child")).toBeInTheDocument(),
		);
	});
	it("[ISSUE-3496-ITEM-3] StorageManagerPersist renders its children when deleting an unparsable bucket fails", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const failing = new (class extends MemoryProvider {
			setItem(): Promise<void> {
				return Promise.reject(new Error("503"));
			}
		})();
		failing.data[keyOf(FILTERS, { model: "x" })] = "{not json";
		StorageManager.configure((_id, keys) => [failing, keys]);
		render(smp({ model: "x" }, <span data-testid={"child"} />));
		await waitFor(() =>
			expect(screen.queryByTestId("child")).toBeInTheDocument(),
		);
	});
	it("[ISSUE-3496-ITEM-3] a filters bucket that cannot be read is not overwritten, while the grid opens with the stored widths and keeps writing them", async () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		const server = new (class extends MemoryProvider {
			getItem(): Promise<string | null> {
				return Promise.reject(new Error("500"));
			}
		})();
		configureLikeSamedis(server);
		const keys = { model: "m", tenant: "t" };
		localStorage.setItem(
			localKeyOf(SIZING, { model: "m" }),
			JSON.stringify({ v: 2, width: { name: 311 }, initialResize: true }),
		);
		render(smp(keys));
		await gridIdle();
		expect(grid!.widths.name).toBe(311);
		expect(grid!.state.search).toBe("");
		expect(error).toHaveBeenCalled();

		act(() => grid!.setState((prev) => ({ ...prev, search: "typed" })));
		act(() => grid!.setWidths((prev) => ({ ...prev, role: 199 })));
		await waitFor(() =>
			expect(
				JSON.parse(localStorage.getItem(localKeyOf(SIZING, { model: "m" }))!),
			).toMatchObject({ width: { name: 311, role: 199 } }),
		);
		expect(grid!.state.search).toBe("typed");
		expect(server.writes).toEqual([]);
	});
	it("[ISSUE-3496-ITEM-3] after a failed read, new storage keys are read and written again", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const server = new (class extends MemoryProvider {
			getItem(key: string): Promise<string | null> {
				if (key.includes('"a"')) return Promise.reject(new Error("500"));
				return super.getItem(key);
			}
		})();
		StorageManager.configure((_id, keys) => [server, keys]);
		server.data[keyOf(FILTERS, { model: "b" })] = JSON.stringify({
			v: 2,
			search: "stored b",
		});
		const { rerender } = render(smp({ model: "a" }));
		await gridIdle();
		expect(server.writes).toEqual([]);

		grid = null;
		rerender(smp({ model: "b" }));
		await gridIdle();
		expect(grid!.state.search).toBe("stored b");
		act(() => grid!.setState((prev) => ({ ...prev, search: "changed b" })));
		await waitFor(() =>
			expect(
				JSON.parse(server.data[keyOf(FILTERS, { model: "b" })]),
			).toMatchObject({ search: "changed b" }),
		);
	});
	it("[ISSUE-3496-ITEM-3] StorageManagerPersist renders its children without waiting for the delete of an unparsable bucket", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const hanging = new (class extends MemoryProvider {
			setItem(key: string, value: string | null): Promise<void> {
				this.writes.push([key, value]);
				return new Promise<void>(() => {});
			}
		})();
		hanging.data[keyOf(FILTERS, { model: "x" })] = "{not json";
		StorageManager.configure((_id, keys) => [hanging, keys]);
		render(smp({ model: "x" }, <span data-testid={"child"} />));
		expect(await screen.findByTestId("child")).toBeInTheDocument();
		expect(hanging.writes).toEqual([[keyOf(FILTERS, { model: "x" }), null]]);
	});

	it("[ISSUE-3496-ITEM-4] a load for the previous storage keys that answers late is neither shown nor written under the new keys", async () => {
		const pending: Record<string, (value: string | null) => void> = {};
		const slow = new (class extends MemoryProvider {
			getItem(key: string) {
				return new Promise<string | null>((resolve) => {
					pending[key] = resolve;
				});
			}
		})();
		StorageManager.configure((_id, keys) => [slow, keys]);
		const A = { model: "A" };
		const B = { model: "B" };
		const { rerender } = render(smp(A));
		await waitFor(() =>
			expect(pending[keyOf(FILTERS, A)]).toBeTypeOf("function"),
		);
		rerender(smp(B));
		await waitFor(() =>
			expect(pending[keyOf(FILTERS, B)]).toBeTypeOf("function"),
		);
		// A's answer arrives after the keys changed to B, and before B's
		await act(async () => {
			pending[keyOf(SIZING, A)](null);
			pending[keyOf(FILTERS, A)](JSON.stringify({ v: 2, search: "from A" }));
			await Promise.resolve();
		});
		await act(async () => {
			pending[keyOf(SIZING, B)](null);
			pending[keyOf(FILTERS, B)](JSON.stringify({ v: 2, search: "from B" }));
			await Promise.resolve();
		});
		await gridIdle();
		const writtenToB = slow.writes.filter(
			([key, value]) =>
				key === keyOf(FILTERS, B) && persisted(value).search === "from A",
		);
		expect(writtenToB).toEqual([]);
		expect(grid!.state.search).toBe("from B");
	});

	it("[ISSUE-3496-ITEM-2] a grid with a sort record stored before a defaultSort was added loads with the user's sort only", async () => {
		const loadData = vi.fn<DataGridProps["loadData"]>(noRows);
		const stored: DataGridPersistentState = {
			v: DATA_GRID_PERSIST_VERSION,
			sort: { role: [1, 1] },
		};
		render(
			<ValueProvider stored={stored} save={vi.fn()}>
				<Grid
					loadData={loadData}
					defaultSort={[{ field: "name", direction: -1 }]}
					sortLimit={0}
				/>
			</ValueProvider>,
		);
		await gridIdle();
		expect(loadData).toHaveBeenCalled();
		expect(loadData.mock.lastCall![0].sort).toEqual([
			{ field: "role", direction: 1 },
		]);
		expect(grid!.columnState.name).toMatchObject({ sort: 0 });
	});

	it("[ISSUE-3496-ITEM-2] a grid opens with its stored sort whatever the defaultSort, and a reset applies the defaultSort", async () => {
		const loadData = vi.fn<DataGridProps["loadData"]>(noRows);
		const save = vi.fn<DataGridPersistentStateContextType[1]>();
		const stored: DataGridPersistentState = {
			v: DATA_GRID_PERSIST_VERSION,
			sort: [["role", 1]],
		};
		render(
			<ValueProvider stored={stored} save={save}>
				<Grid
					loadData={loadData}
					defaultSort={[{ field: "name", direction: -1 }]}
				/>
			</ValueProvider>,
		);
		await gridIdle();
		expect(loadData.mock.lastCall![0].sort).toEqual([
			{ field: "role", direction: 1 },
		]);

		// the header is laid out for a phone here: the reset sits in "More options"
		fireEvent.click(screen.getByRole("button", { name: "More options" }));
		fireEvent.click(await screen.findByRole("menuitem", { name: "Reset" }));
		fireEvent.click(
			await screen.findByRole("menuitem", { name: "Reset sort settings" }),
		);
		await waitFor(() =>
			expect(loadData.mock.lastCall![0].sort).toEqual([
				{ field: "name", direction: -1 },
			]),
		);
		expect(save.mock.lastCall![0].sort).toEqual([["name", -1]]);
	});

	it("[ISSUE-3496-ITEM-2] a grid with nothing stored opens with the defaultSort, and stores it as its sort", async () => {
		const loadData = vi.fn<DataGridProps["loadData"]>(noRows);
		const save = vi.fn<DataGridPersistentStateContextType[1]>();
		render(
			<ValueProvider stored={undefined} save={save}>
				<Grid
					loadData={loadData}
					defaultSort={[{ field: "name", direction: -1 }]}
				/>
			</ValueProvider>,
		);
		await gridIdle();
		expect(loadData.mock.lastCall![0].sort).toEqual([
			{ field: "name", direction: -1 },
		]);
		act(() => grid!.setState((prev) => ({ ...prev, search: "s" })));
		expect(save.mock.lastCall![0].sort).toEqual([["name", -1]]);
	});
});

describe("restored column widths", () => {
	it("[ISSUE-3496-ITEM-14] restored column widths below the header's minimum are raised to it", async () => {
		render(
			<ValueProvider
				stored={{
					v: DATA_GRID_PERSIST_VERSION,
					width: { name: 10, role: 16 },
					initialResize: true,
				}}
				save={vi.fn()}
			>
				<Grid />
			</ValueProvider>,
		);
		await gridIdle();
		// the floor of a filterable column: room for the header's padding,
		// sort arrow and filter button
		const floor = applyColumnWidthLimits(GRID_COLUMNS[0], 0);
		expect(floor).toBeGreaterThan(16);
		expect(grid!.widths.name).toBeGreaterThanOrEqual(floor);
		expect(grid!.widths.role).toBeGreaterThanOrEqual(floor);
	});

	it("[ISSUE-3496-ITEM-14] legacy column widths below the header's minimum are raised to it, wider ones and those of undefined columns are kept", async () => {
		localStorage.setItem(
			"legacy",
			JSON.stringify({
				columnWidth: { name: 12, role: 250, gone: 8 },
				state: { initialResize: true },
			}),
		);
		render(
			<LocalStoragePersist storageKey={"legacy"}>
				<Grid />
			</LocalStoragePersist>,
		);
		await gridIdle();
		expect(grid!.widths.name).toBe(applyColumnWidthLimits(GRID_COLUMNS[0], 0));
		expect(grid!.widths.role).toBe(250);
		expect(grid!.widths.gone).toBe(8);
	});
});
