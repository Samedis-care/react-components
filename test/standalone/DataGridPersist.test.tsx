import React, { StrictMode, useContext, useMemo, useState } from "react";
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
import NoPersist from "../../src/standalone/DataGrid/NoPersist";
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
			// the bar has no width in jsdom: 0 keeps it in the header
			enableFilterDialogWidth={0}
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
	/** The part of Node's process this file uses (the test config has no Node types) */
	interface RejectionEvents {
		listeners(event: "unhandledRejection"): ((reason: unknown) => void)[];
		removeAllListeners(event: "unhandledRejection"): void;
		on(event: "unhandledRejection", listener: (reason: unknown) => void): void;
		off(event: "unhandledRejection", listener: (reason: unknown) => void): void;
	}
	const nodeProcess = (globalThis as unknown as { process: RejectionEvents })
		.process;
	let rejections: unknown[] = [];
	let savedListeners: ((reason: unknown) => void)[] = [];
	const collectRejection = (reason: unknown) => {
		rejections.push(reason);
	};
	beforeEach(() => {
		rejections = [];
		savedListeners = nodeProcess.listeners("unhandledRejection");
		nodeProcess.removeAllListeners("unhandledRejection");
		nodeProcess.on("unhandledRejection", collectRejection);
	});
	afterEach(async () => {
		await new Promise((resolve) => setTimeout(resolve, 0));
		nodeProcess.off("unhandledRejection", collectRejection);
		savedListeners.forEach((listener) =>
			nodeProcess.on("unhandledRejection", listener),
		);
	});

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
	it("[ISSUE-3496-ITEM-7] a grid does not overwrite data of a newer format version when it opens", async () => {
		const save = vi.fn<DataGridPersistentStateContextType[1]>();
		const newer = {
			v: DATA_GRID_PERSIST_VERSION + 1,
			shown: ["name", "role"],
			hidden: ["secret"],
			layout: { name: "compact" },
		} as unknown as DataGridPersistentState;
		render(
			<ValueProvider stored={newer} save={save}>
				<Grid />
			</ValueProvider>,
		);
		await gridIdle();
		expect(save).not.toHaveBeenCalled();
	});
	/** What the grid does once it knows its width, which jsdom never reports */
	const autoFit = () =>
		act(() => {
			grid!.setWidths((prev) => ({ ...prev, name: 500, role: 400 }));
			grid!.setState((prev) => ({ ...prev, initialResize: true }));
		});
	it("[ISSUE-3496-ITEM-7] the auto-fit of the column widths does not write over data of a newer format version, the first change writes it in the current one", async () => {
		const save = vi.fn<DataGridPersistentStateContextType[1]>();
		const newer = {
			v: DATA_GRID_PERSIST_VERSION + 1,
			shown: ["name", "role"],
			hidden: ["secret"],
			search: "kept",
			sizing: { name: 300 },
		} as unknown as DataGridPersistentState;
		render(
			<ValueProvider stored={newer} save={save}>
				<Grid />
			</ValueProvider>,
		);
		await gridIdle();
		expect(grid!.state.search).toBe("kept");
		expect(grid!.state.initialResize).toBe(false);
		autoFit();
		expect(save).not.toHaveBeenCalled();

		act(() => grid!.setState((prev) => ({ ...prev, search: "typed" })));
		expect(save).toHaveBeenCalledTimes(1);
		expect(save.mock.lastCall![0]).toMatchObject({
			v: DATA_GRID_PERSIST_VERSION,
			shown: ["name", "role"],
			hidden: ["secret"],
			search: "typed",
			width: { name: 500, role: 400 },
			initialResize: true,
		});
		expect(save.mock.lastCall![0]).not.toHaveProperty("sizing");
	});
	it("[ISSUE-3496-ITEM-7] the auto-fit of the column widths still writes over data of the current format version", async () => {
		const save = vi.fn<DataGridPersistentStateContextType[1]>();
		const current: DataGridPersistentState = {
			v: DATA_GRID_PERSIST_VERSION,
			shown: ["name", "role"],
			hidden: ["secret"],
		};
		render(
			<ValueProvider stored={current} save={save}>
				<Grid />
			</ValueProvider>,
		);
		await gridIdle();
		autoFit();
		expect(save).toHaveBeenCalledTimes(1);
		expect(save.mock.lastCall![0]).toMatchObject({
			v: DATA_GRID_PERSIST_VERSION,
			width: { name: 500, role: 400 },
			initialResize: true,
		});
	});
	it("[ISSUE-3496-ITEM-7] the auto-fit does not write over a shared sizing bucket of a newer format version next to a current filters bucket", async () => {
		const server = new MemoryProvider();
		configureLikeSamedis(server);
		const keys = { model: "m", tenant: "t" };
		// a newer version opened another tenant's grid and wrote the sizing
		// bucket, which samedis.care shares across tenants, in its format
		const newerSizing = JSON.stringify({
			v: DATA_GRID_PERSIST_VERSION + 1,
			sizing: { name: 300 },
		});
		localStorage.setItem(localKeyOf(SIZING, { model: "m" }), newerSizing);
		server.data[keyOf(FILTERS, keys)] = JSON.stringify({
			v: DATA_GRID_PERSIST_VERSION,
			shown: ["name", "role"],
			hidden: ["secret"],
			search: "kept",
		});
		const local = vi.spyOn(LocalStorageProviderInstance, "setItem");
		render(smp(keys));
		await gridIdle();
		expect(grid!.state.search).toBe("kept");
		autoFit();
		expect(local).not.toHaveBeenCalled();
		expect(server.writes).toEqual([]);
		expect(localStorage.getItem(localKeyOf(SIZING, { model: "m" }))).toBe(
			newerSizing,
		);

		act(() => grid!.setState((prev) => ({ ...prev, search: "typed" })));
		await waitFor(() =>
			expect(persisted(server.data[keyOf(FILTERS, keys)]).search).toBe("typed"),
		);
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
	it("[ISSUE-3496-ITEM-9] a sizing bucket that cannot be written does not keep the filters bucket from being written", async () => {
		const server = new (class extends MemoryProvider {
			setItem(key: string, value: string | null): Promise<void> {
				// LocalStorageProviderInstance throws like this when localStorage is full
				if (key.startsWith(SIZING))
					throw new DOMException("full", "QuotaExceededError");
				return super.setItem(key, value);
			}
		})();
		StorageManager.configure((_id, keys) => [server, keys]);
		const keys = { model: "m" };
		render(smp(keys));
		await gridIdle();
		act(() => grid!.setState((prev) => ({ ...prev, search: "q" })));
		await act(async () => {});
		expect(server.data[keyOf(FILTERS, keys)]).toBeDefined();
		expect(persisted(server.data[keyOf(FILTERS, keys)]).search).toBe("q");
	});
	it("[ISSUE-3496-ITEM-9] a failing write is handled, not an unhandled rejection", async () => {
		const server = new (class extends MemoryProvider {
			setItem(key: string, value: string | null): Promise<void> {
				if (key.startsWith(FILTERS)) return Promise.reject(new Error("503"));
				return super.setItem(key, value);
			}
		})();
		StorageManager.configure((_id, keys) => [server, keys]);
		render(smp({ model: "m" }));
		await gridIdle();
		act(() => grid!.setState((prev) => ({ ...prev, search: "q" })));
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		expect(rejections).toEqual([]);
	});
	it("[ISSUE-3496-ITEM-9] a bucket that cannot be written is logged, naming the bucket", async () => {
		const log = vi.spyOn(console, "error").mockImplementation(() => {});
		const full = new DOMException("full", "QuotaExceededError");
		const server = new (class extends MemoryProvider {
			setItem(key: string, value: string | null): Promise<void> {
				if (key.startsWith(SIZING)) throw full;
				return super.setItem(key, value);
			}
		})();
		StorageManager.configure((_id, keys) => [server, keys]);
		render(smp({ model: "m" }));
		await gridIdle();
		act(() => grid!.setState((prev) => ({ ...prev, search: "q" })));
		await act(async () => {});
		const logged = log.mock.calls.flat().filter((arg) => arg instanceof Error);
		expect(logged).toHaveLength(1);
		expect(logged[0].message).toContain(SIZING);
		expect(logged[0].message).not.toContain(FILTERS);
		expect(logged[0].cause).toBe(full);
		expect(rejections).toEqual([]);
	});
	it("[ISSUE-3496-ITEM-9] two buckets that cannot be written are both logged", async () => {
		const log = vi.spyOn(console, "error").mockImplementation(() => {});
		const server = new (class extends MemoryProvider {
			setItem(): Promise<void> {
				return Promise.reject(new Error("503"));
			}
		})();
		StorageManager.configure((_id, keys) => [server, keys]);
		render(smp({ model: "m" }));
		await gridIdle();
		act(() => grid!.setState((prev) => ({ ...prev, search: "q" })));
		await act(async () => {});
		const logged = log.mock.calls
			.flat()
			.filter((arg) => arg instanceof AggregateError);
		expect(logged).toHaveLength(1);
		expect(
			(logged[0].errors as Error[]).map((error) => error.message).join(),
		).toMatch(new RegExp(`${SIZING}.*${FILTERS}`));
	});
	it("[ISSUE-3496-ITEM-9] a bucket whose write failed is written again with the grid's next state update, also when nothing persisted changed", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const server = new (class extends MemoryProvider {
			failures = 1;
			setItem(key: string, value: string | null): Promise<void> {
				if (key.startsWith(FILTERS) && this.failures > 0) {
					this.failures--;
					return Promise.reject(new Error("503"));
				}
				return super.setItem(key, value);
			}
		})();
		StorageManager.configure((_id, keys) => [server, keys]);
		const keys = { model: "m" };
		render(smp(keys));
		await gridIdle();
		act(() => grid!.setState((prev) => ({ ...prev, search: "q" })));
		await act(async () => {});
		expect(server.failures).toBe(0);
		expect(server.data[keyOf(FILTERS, keys)]).toBeUndefined();
		// a state update that changes nothing persisted, like a page of rows loaded
		act(() => grid!.setState((prev) => ({ ...prev })));
		await act(async () => {});
		expect(server.data[keyOf(FILTERS, keys)]).toBeDefined();
		expect(persisted(server.data[keyOf(FILTERS, keys)]).search).toBe("q");
	});
	it("[ISSUE-3496-ITEM-9] a bucket whose write fails after the next change was written is written again with the grid's next state update", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		let fail: (error: Error) => void = () => {};
		const server = new (class extends MemoryProvider {
			failures = 1;
			setItem(key: string, value: string | null): Promise<void> {
				if (key.startsWith(FILTERS) && this.failures > 0) {
					this.failures--;
					// a server which answers late
					return new Promise((_resolve, reject) => (fail = reject));
				}
				return super.setItem(key, value);
			}
		})();
		StorageManager.configure((_id, keys) => [server, keys]);
		const keys = { model: "m" };
		render(smp(keys));
		await gridIdle();
		act(() => grid!.setState((prev) => ({ ...prev, search: "q" })));
		// the next change is to the widths only, so it leaves the filters bucket
		// to the write still running
		act(() => grid!.setWidths((prev) => ({ ...prev, name: 321 })));
		act(() => fail(new Error("503")));
		await act(async () => {});
		expect(server.data[keyOf(FILTERS, keys)]).toBeUndefined();
		act(() => grid!.setState((prev) => ({ ...prev })));
		await act(async () => {});
		expect(server.data[keyOf(FILTERS, keys)]).toBeDefined();
		expect(persisted(server.data[keyOf(FILTERS, keys)]).search).toBe("q");
	});
	it("[ISSUE-3496-ITEM-9] a setter that throws is logged, keeps the grid working and gets the data again with the grid's next state update", async () => {
		const log = vi.spyOn(console, "error").mockImplementation(() => {});
		const quota = new DOMException("full", "QuotaExceededError");
		const save = vi.fn<DataGridPersistentStateContextType[1]>(() => {
			if (save.mock.calls.length === 1) throw quota;
		});
		render(
			<ValueProvider stored={undefined} save={save}>
				<Grid />
			</ValueProvider>,
		);
		await gridIdle();
		act(() => grid!.setState((prev) => ({ ...prev, search: "q" })));
		await act(async () => {});
		expect(log.mock.calls.flat()).toContain(quota);
		expect(screen.getByRole("textbox")).toBeInTheDocument();
		act(() => grid!.setState((prev) => ({ ...prev })));
		expect(save).toHaveBeenCalledTimes(2);
		expect(save.mock.calls[1][0]).toEqual(save.mock.calls[0][0]);
		expect(save.mock.calls[1][0].search).toBe("q");
	});
	it("[ISSUE-3496-ITEM-10] LocalStoragePersist renders when localStorage cannot be read", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
			throw new DOMException("denied", "SecurityError");
		});
		expect(() =>
			render(
				<LocalStoragePersist storageKey={"blocked"}>
					<span data-testid={"child"} />
				</LocalStoragePersist>,
			),
		).not.toThrow();
		expect(screen.getByTestId("child")).toBeInTheDocument();
	});
	it("[ISSUE-3496-ITEM-10] a grid under LocalStoragePersist opens at its defaults when the browser blocks localStorage, keeps its changes, and the failed read and write are logged", async () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		// the browser throws when the page reads window.localStorage
		const denied = new DOMException("denied", "SecurityError");
		vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
			throw denied;
		});
		render(
			<LocalStoragePersist storageKey={"blocked"}>
				<Grid />
			</LocalStoragePersist>,
		);
		await gridIdle();
		expect(grid!.state.search).toBe("");
		expect(error).toHaveBeenCalledWith(expect.any(String), denied);

		error.mockClear();
		act(() => grid!.setState((prev) => ({ ...prev, search: "typed" })));
		expect(grid!.state.search).toBe("typed");
		expect(error).toHaveBeenCalledWith(expect.any(String), denied);
	});
	it("[ISSUE-3496-ITEM-10] LocalStoragePersist renders when an unparsable entry cannot be removed, and logs it", () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		localStorage.setItem("broken", "{not json");
		const denied = new DOMException("denied", "SecurityError");
		vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
			throw denied;
		});
		render(
			<LocalStoragePersist storageKey={"broken"}>
				<Probe testId={"a"} />
			</LocalStoragePersist>,
		);
		expect(screen.getByTestId("a")).toHaveTextContent("none");
		expect(error).toHaveBeenCalledWith(expect.any(String), denied);
	});

	it("[ISSUE-3496-ITEM-15] keyboard focus in the grid survives a storageKeys change", async () => {
		const { rerender } = render(smp({ model: "a" }));
		await gridIdle();
		const search = screen.getByRole("textbox");
		act(() => search.focus());
		expect(search).toHaveFocus();
		rerender(smp({ model: "a", tenant: "t2" }));
		await waitFor(() =>
			expect(screen.getByRole("textbox")).toBeInTheDocument(),
		);
		await gridIdle();
		expect(document.activeElement).not.toBe(document.body);
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

describe("custom data on the next visit", () => {
	type Wrap = (child: React.ReactElement) => React.ReactElement;
	function underLocalStorage(child: React.ReactElement) {
		return (
			<LocalStoragePersist storageKey={"custom-data"}>
				{child}
			</LocalStoragePersist>
		);
	}
	/** the filters go to a "server", as in an app that filters on its backend */
	function underStorageManager(child: React.ReactElement) {
		return (
			<StorageManagerPersist storageKeys={{ model: "m" }}>
				{child}
			</StorageManagerPersist>
		);
	}
	/** each provider as an app sets it up: [name, set up the storage and return the wrapper] */
	const providers: [name: string, setUp: () => Wrap][] = [
		["LocalStoragePersist", () => underLocalStorage],
		[
			"StorageManagerPersist",
			() => {
				const server = new MemoryProvider();
				StorageManager.configure((_id, keys) => [server, keys]);
				return underStorageManager;
			},
		],
	];

	/**
	 * Sets the custom data in a grid, then opens the grid again under a new
	 * provider, which reads the storage as after a reload
	 * @returns the custom data the grid opens with then
	 */
	const nextVisit = async (wrap: Wrap, customData: Record<string, unknown>) => {
		render(wrap(<Grid />));
		await gridIdle();
		act(() => grid!.setState((prev) => ({ ...prev, customData })));
		cleanup();
		grid = null;
		render(wrap(<Grid />));
		await gridIdle();
		return grid!.state.customData;
	};

	it.each(providers)(
		"[ISSUE-3496-ITEM-19] %s: custom data of JSON values comes back as it was set",
		async (_name, setUp) => {
			const customData = {
				"filter[status]": "open",
				"filter[ids]": ["a", "b"],
				"filter[min]": 0,
				"filter[archived]": false,
				"filter[team]": null,
				period: { from: "2026-01-01", to: null, weekdays: [1, 5] },
			};
			expect(await nextVisit(setUp(), customData)).toStrictEqual(customData);
		},
	);

	it.each(providers)(
		"[ISSUE-3496-ITEM-19] %s: other values in the custom data come back in their JSON form, as DataGridCustomDataType documents",
		async (_name, setUp) => {
			class DateRange {
				constructor(readonly from: string) {}
				get label() {
					return "from " + this.from;
				}
			}
			/** like a Moment or a Dayjs */
			class Day {
				constructor(readonly iso: string) {}
				toJSON() {
					return this.iso;
				}
			}
			const restored = await nextVisit(setUp(), {
				date: new Date("2026-01-02T00:00:00.000Z"),
				day: new Day("2026-01-03"),
				map: new Map([["a", 1]]),
				set: new Set(["a"]),
				range: new DateRange("2026-01-01"),
				nan: NaN,
				infinity: Infinity,
				list: [1, undefined, () => 2],
				fn: () => 1,
				undef: undefined,
			});
			expect(restored).toStrictEqual({
				date: "2026-01-02T00:00:00.000Z",
				day: "2026-01-03",
				map: {},
				set: {},
				range: { from: "2026-01-01" },
				nan: null,
				infinity: null,
				list: [1, null, null],
			});
		},
	);
});

describe("StorageManagerPersist bucket writes", () => {
	const smp = (keys: Record<string, string>, child = <Grid />) => (
		<ThemeProvider theme={theme}>
			<StorageManagerPersist storageKeys={keys}>{child}</StorageManagerPersist>
		</ThemeProvider>
	);

	/** shows what the provider provides for the given keys, and keeps its setter */
	const probe = (keys: Record<string, string>) => (
		<ThemeProvider theme={theme}>
			<StorageManagerPersist storageKeys={keys}>
				<Probe testId={"a"} />
			</StorageManagerPersist>
		</ThemeProvider>
	);

	/** what a write of WRITTEN stores in the filters bucket */
	const writtenFilters = () =>
		JSON.stringify({
			v: WRITTEN.v,
			search: WRITTEN.search,
			customData: WRITTEN.customData,
		});

	it("[ISSUE-3496-ITEM-8] a column resize writes only the sizing bucket", async () => {
		const server = new MemoryProvider();
		StorageManager.configure((_id, keys) => [server, keys]);
		const keys = { model: "m" };
		render(smp(keys));
		await gridIdle();
		// a grid writes nothing when it opens, its first change writes both
		act(() => grid!.setState((prev) => ({ ...prev, search: "s" })));
		expect(server.writes.map(([key]) => key)).toEqual([
			keyOf(SIZING, keys),
			keyOf(FILTERS, keys),
		]);
		server.writes = [];
		act(() => grid!.setWidths((prev) => ({ ...prev, name: 321 })));
		expect(server.writes.map(([key]) => key)).toEqual([keyOf(SIZING, keys)]);
	});

	it("[ISSUE-3496-ITEM-8] typing in the search writes only the filters bucket", async () => {
		const server = new MemoryProvider();
		configureLikeSamedis(server);
		const keys = { model: "m", tenant: "t" };
		render(smp(keys));
		await gridIdle();
		act(() => grid!.setWidths((prev) => ({ ...prev, name: 321 })));
		server.writes = [];
		const local = vi.spyOn(LocalStorageProviderInstance, "setItem");
		act(() => grid!.setState((prev) => ({ ...prev, search: "a" })));
		act(() => grid!.setState((prev) => ({ ...prev, search: "ab" })));
		expect(local).not.toHaveBeenCalled();
		expect(server.writes.map(([key]) => key)).toEqual([
			keyOf(FILTERS, keys),
			keyOf(FILTERS, keys),
		]);
	});

	it("[ISSUE-3496-ITEM-8] a grid opened on what an earlier visit stored writes only the sizing bucket on a resize", async () => {
		const server = new MemoryProvider();
		StorageManager.configure((_id, keys) => [server, keys]);
		const keys = { model: "m" };
		render(smp(keys));
		await gridIdle();
		act(() =>
			grid!.setState((prev) => ({
				...prev,
				search: "s",
				columnHidden: { ...prev.columnHidden, role: true },
				customData: { "filter[status]": "open" },
			})),
		);
		act(() => grid!.setWidths((prev) => ({ ...prev, name: 321 })));
		cleanup();
		grid = null;

		server.writes = [];
		render(smp(keys));
		await gridIdle();
		expect(grid!.state.search).toBe("s");
		expect(grid!.widths.name).toBe(321);
		act(() => grid!.setWidths((prev) => ({ ...prev, name: 300 })));
		expect(server.writes.map(([key]) => key)).toEqual([keyOf(SIZING, keys)]);
	});

	it("[ISSUE-3496-ITEM-8] a bucket changed back to what it held when the grid opened is written again", async () => {
		const server = new MemoryProvider();
		StorageManager.configure((_id, keys) => [server, keys]);
		const keys = { model: "m" };
		const sizing: DataGridPersistentState = {
			v: DATA_GRID_PERSIST_VERSION,
			width: { name: 200 },
			initialResize: true,
		};
		server.data[keyOf(SIZING, keys)] = JSON.stringify(sizing);
		server.data[keyOf(FILTERS, keys)] = JSON.stringify(STORED);
		render(probe(keys));
		expect(await screen.findByTestId("a")).toHaveTextContent("stored");

		await act(async () => {
			await write!({ ...sizing, ...STORED, search: "typed" });
		});
		// back to what is stored, e.g. by a reset: the bucket holds "typed" now
		await act(async () => {
			await write!({ ...sizing, ...STORED });
		});
		expect(server.writes).toEqual([
			[keyOf(FILTERS, keys), JSON.stringify({ ...STORED, search: "typed" })],
			[keyOf(FILTERS, keys), JSON.stringify(STORED)],
		]);
	});

	it("[ISSUE-3496-ITEM-8] other storage keys start from what is stored for them", async () => {
		const server = new MemoryProvider();
		StorageManager.configure((_id, keys) => [server, keys]);
		const a = { model: "a" };
		const b = { model: "b" };
		server.data[keyOf(FILTERS, b)] = JSON.stringify(STORED);
		const { rerender } = render(probe(a));
		expect(await screen.findByTestId("a")).toHaveTextContent("none");
		// the children render at once and show "none" before the buckets are read
		// (ISSUE-3496-ITEM-16): the setter comes with the read
		await waitFor(() => expect(write).not.toBeNull());
		await act(async () => {
			await write!(WRITTEN);
		});

		rerender(probe(b));
		await waitFor(() =>
			expect(screen.getByTestId("a")).toHaveTextContent("stored"),
		);
		await act(async () => {
			await write!(WRITTEN);
		});
		expect(server.writes).toEqual([
			[keyOf(SIZING, a), JSON.stringify({ v: WRITTEN.v })],
			[keyOf(FILTERS, a), writtenFilters()],
			[keyOf(SIZING, b), JSON.stringify({ v: WRITTEN.v })],
			[keyOf(FILTERS, b), writtenFilters()],
		]);
	});

	it("[ISSUE-3496-ITEM-8] storage keys read again start from what is stored for them then", async () => {
		const server = new MemoryProvider();
		StorageManager.configure((_id, keys) => [server, keys]);
		const a = { model: "a" };
		const b = { model: "b" };
		server.data[keyOf(FILTERS, b)] = JSON.stringify(STORED);
		const { rerender } = render(probe(a));
		expect(await screen.findByTestId("a")).toHaveTextContent("none");
		// the children render at once and show "none" before the buckets are read
		// (ISSUE-3496-ITEM-16): the setter comes with the read
		await waitFor(() => expect(write).not.toBeNull());
		await act(async () => {
			await write!(WRITTEN);
		});
		rerender(probe(b));
		await waitFor(() =>
			expect(screen.getByTestId("a")).toHaveTextContent("stored"),
		);

		// meanwhile a's filters were changed elsewhere (another tab)
		server.data[keyOf(FILTERS, a)] = JSON.stringify({
			...STORED,
			search: "elsewhere",
		});
		server.writes = [];
		rerender(probe(a));
		// the provider provides nothing until a is read
		expect(write).toBeNull();
		await waitFor(() => expect(write).not.toBeNull());
		await act(async () => {
			await write!(WRITTEN);
		});
		expect(server.writes).toEqual([[keyOf(FILTERS, a), writtenFilters()]]);
	});

	it("[ISSUE-3496-ITEM-8] a bucket whose write failed is written with the next change", async () => {
		const server = new (class extends MemoryProvider {
			failures = 1;
			setItem(key: string, value: string | null): Promise<void> {
				if (key.startsWith(FILTERS) && this.failures > 0) {
					this.failures--;
					return Promise.reject(new Error("503"));
				}
				return super.setItem(key, value);
			}
		})();
		StorageManager.configure((_id, keys) => [server, keys]);
		const keys = { model: "m" };
		render(probe(keys));
		await screen.findByTestId("a");
		// the probe shows before the buckets are read; the setter comes with the read
		await waitFor(() => expect(write).not.toBeNull());
		await act(async () => {
			await Promise.resolve(write!(WRITTEN)).catch(() => {});
		});
		expect(server.failures).toBe(0);
		expect(server.data[keyOf(FILTERS, keys)]).toBeUndefined();

		// only the widths change, the filters bucket still lacks the search
		await act(async () => {
			await write!({ ...WRITTEN, width: { name: 200 } });
		});
		expect(server.data[keyOf(FILTERS, keys)]).toBe(writtenFilters());
	});
});

describe("keyboard focus across a storage key change", () => {
	/** A storage whose reads wait for release() while it is held */
	class HeldProvider extends MemoryProvider {
		held = false;
		waiting: (() => void)[] = [];
		getItem(key: string): Promise<string | null> {
			if (!this.held) return super.getItem(key);
			return new Promise((resolve) => {
				this.waiting.push(() => resolve(this.data[key] ?? null));
			});
		}
		release() {
			this.held = false;
			this.waiting.splice(0).forEach((resume) => resume());
		}
	}
	let storage = new HeldProvider();
	beforeEach(() => {
		storage = new HeldProvider();
		StorageManager.configure((_id, keys) => [storage, keys]);
	});

	const smp = (keys: Record<string, string>, child = <Grid />) => (
		<ThemeProvider theme={theme}>
			<button>Outside</button>
			<StorageManagerPersist storageKeys={keys}>{child}</StorageManagerPersist>
		</ThemeProvider>
	);
	/** the search field of the grid mounted in place of the given one */
	const nextSearch = async (previous: HTMLElement) => {
		await waitFor(() => {
			expect(screen.getByRole("textbox")).not.toBe(previous);
			expect(previous).not.toBeInTheDocument();
		});
		await gridIdle();
		return screen.getByRole("textbox");
	};
	const focusSearch = async () => {
		await gridIdle();
		const search = screen.getByRole("textbox");
		act(() => search.focus());
		expect(search).toHaveFocus();
		return search;
	};

	it("[ISSUE-3496-ITEM-15] the search field of the grid mounted for the new storage keys has keyboard focus", async () => {
		const { rerender } = render(smp({ model: "a" }));
		const search = await focusSearch();
		rerender(smp({ model: "a", tenant: "t2" }));
		expect(await nextSearch(search)).toHaveFocus();
	});

	it("[ISSUE-3496-ITEM-15] in StrictMode, the search field of the grid mounted for the new storage keys has keyboard focus", async () => {
		const { rerender } = render(<StrictMode>{smp({ model: "a" })}</StrictMode>);
		const search = await focusSearch();
		rerender(<StrictMode>{smp({ model: "a", tenant: "t2" })}</StrictMode>);
		expect(await nextSearch(search)).toHaveFocus();
	});

	it("[ISSUE-3496-ITEM-15] the Loader has keyboard focus while the new storage keys load", async () => {
		const { rerender } = render(smp({ model: "a" }));
		const search = await focusSearch();
		storage.held = true;
		rerender(smp({ model: "a", tenant: "t2" }));
		await waitFor(() => expect(storage.waiting).toHaveLength(2));
		expect(screen.getByRole("progressbar")).toBeInTheDocument();
		expect(screen.getByRole("status")).toHaveFocus();
		await act(async () => {
			storage.release();
			await Promise.resolve();
		});
		expect(await nextSearch(search)).toHaveFocus();
	});

	it("[ISSUE-3496-ITEM-15] focus moved from the Loader to another element while the new storage keys load stays there", async () => {
		const { rerender } = render(smp({ model: "a" }));
		const search = await focusSearch();
		storage.held = true;
		rerender(smp({ model: "a", tenant: "t2" }));
		await waitFor(() => expect(screen.getByRole("status")).toHaveFocus());
		const outside = screen.getByRole("button", { name: "Outside" });
		act(() => outside.focus());
		await act(async () => {
			storage.release();
			await Promise.resolve();
		});
		expect(await nextSearch(search)).not.toHaveFocus();
		expect(outside).toHaveFocus();
	});

	it("[ISSUE-3496-ITEM-15] focus moved from the Loader to the page while the new storage keys load stays there", async () => {
		const { rerender } = render(smp({ model: "a" }));
		const search = await focusSearch();
		storage.held = true;
		rerender(smp({ model: "a", tenant: "t2" }));
		await waitFor(() => expect(screen.getByRole("status")).toHaveFocus());
		act(() => screen.getByRole("status").blur());
		// what blurring leaves the Loader's blur handler to check
		await act(async () => {});
		await act(async () => {
			storage.release();
			await Promise.resolve();
		});
		expect(await nextSearch(search)).not.toHaveFocus();
		expect(document.activeElement).toBe(document.body);
	});

	it("[ISSUE-3496-ITEM-15] focus outside the grid stays there when the storage keys change", async () => {
		const { rerender } = render(smp({ model: "a" }));
		const search = await focusSearch();
		const outside = screen.getByRole("button", { name: "Outside" });
		act(() => outside.focus());
		rerender(smp({ model: "a", tenant: "t2" }));
		expect(await nextSearch(search)).not.toHaveFocus();
		expect(outside).toHaveFocus();
	});

	// the filter bar of a grid shows the buttons it mounted with
	let mountWith = ["One", "Two"];
	const Buttons = (props: IDataGridFilterBarProps) => {
		const [names] = useState(mountWith);
		return (
			<>
				<ProbeBar {...props} />
				{names.map((name) => (
					<button key={name}>{name}</button>
				))}
			</>
		);
	};

	it("[ISSUE-3496-ITEM-15] focus on a filter bar control moves to the same control of the grid mounted for the new storage keys", async () => {
		mountWith = ["One", "Two"];
		const { rerender } = render(
			smp({ model: "a" }, <Grid filterBar={Buttons} />),
		);
		await gridIdle();
		const two = screen.getByRole("button", { name: "Two" });
		act(() => two.focus());
		const search = screen.getByRole("textbox");
		rerender(smp({ model: "a", tenant: "t2" }, <Grid filterBar={Buttons} />));
		await nextSearch(search);
		expect(two).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Two" })).toHaveFocus();
	});

	it("[ISSUE-3496-ITEM-15] focus on a control which the grid mounted for the new storage keys lacks moves to the grid's first control", async () => {
		mountWith = ["One", "Two"];
		const { rerender } = render(
			smp({ model: "a" }, <Grid filterBar={Buttons} />),
		);
		await gridIdle();
		const two = screen.getByRole("button", { name: "Two" });
		act(() => two.focus());
		expect(two).toHaveFocus();
		const search = screen.getByRole("textbox");
		mountWith = ["One"];
		rerender(smp({ model: "a", tenant: "t2" }, <Grid filterBar={Buttons} />));
		// the search field comes first in the grid
		expect(await nextSearch(search)).toHaveFocus();
		expect(
			screen.queryByRole("button", { name: "Two" }),
		).not.toBeInTheDocument();
	});

	it("[ISSUE-3496-ITEM-15] the Loader keeps keyboard focus while the storage keys change again, and the grid mounted for the last ones gets it", async () => {
		const { rerender } = render(smp({ model: "a" }));
		const search = await focusSearch();
		storage.held = true;
		rerender(smp({ model: "a", tenant: "t2" }));
		await waitFor(() => expect(screen.getByRole("status")).toHaveFocus());
		rerender(smp({ model: "a", tenant: "t3" }));
		await waitFor(() => expect(storage.waiting).toHaveLength(4));
		expect(screen.getByRole("status")).toHaveFocus();
		await act(async () => {
			storage.release();
			await Promise.resolve();
		});
		expect(await nextSearch(search)).toHaveFocus();
	});

	it("[ISSUE-3496-ITEM-15] a grid that the app unmounts and shows again under the same storage keys does not take focus", async () => {
		const { rerender } = render(smp({ model: "a" }));
		const search = await focusSearch();
		rerender(smp({ model: "a" }, <></>));
		expect(search).not.toBeInTheDocument();
		expect(document.activeElement).toBe(document.body);
		rerender(smp({ model: "a" }));
		expect(await nextSearch(search)).not.toHaveFocus();
		expect(document.activeElement).toBe(document.body);
	});

	const lsp = (storageKey: string, child = <Grid />) => (
		<ThemeProvider theme={theme}>
			<LocalStoragePersist storageKey={storageKey}>{child}</LocalStoragePersist>
		</ThemeProvider>
	);

	it("[ISSUE-3496-ITEM-15] keyboard focus in the grid survives a LocalStoragePersist storageKey change", async () => {
		const { rerender } = render(lsp("a"));
		const search = await focusSearch();
		rerender(lsp("b"));
		expect(await nextSearch(search)).toHaveFocus();
	});

	it("[ISSUE-3496-ITEM-15] a control that the grid mounted for the new storageKey focuses itself keeps focus", async () => {
		const AutoFocus = (props: IDataGridFilterBarProps) => (
			<>
				<ProbeBar {...props} />
				<button autoFocus>Mine</button>
			</>
		);
		const { rerender } = render(lsp("a"));
		const search = await focusSearch();
		rerender(lsp("b", <Grid filterBar={AutoFocus} />));
		expect(await nextSearch(search)).not.toHaveFocus();
		expect(screen.getByRole("button", { name: "Mine" })).toHaveFocus();
	});
});

describe("only the grids wait for the stored state", () => {
	/** A storage whose reads wait for release() while it is held */
	class HeldProvider extends MemoryProvider {
		held = false;
		waiting: (() => void)[] = [];
		getItem(key: string): Promise<string | null> {
			if (!this.held) return super.getItem(key);
			return new Promise((resolve) => {
				this.waiting.push(() => resolve(this.data[key] ?? null));
			});
		}
		release() {
			this.held = false;
			this.waiting.splice(0).forEach((resume) => resume());
		}
	}

	const smp = (keys: Record<string, string>, child = <Grid />) => (
		<ThemeProvider theme={theme}>
			<StorageManagerPersist storageKeys={keys}>
				<h1>People</h1>
				<input aria-label={"Note"} />
				{child}
			</StorageManagerPersist>
		</ThemeProvider>
	);
	const lsp = (storageKey: string, child = <Grid />) => (
		<ThemeProvider theme={theme}>
			<LocalStoragePersist storageKey={storageKey}>
				<h1>People</h1>
				<input aria-label={"Note"} />
				{child}
			</LocalStoragePersist>
		</ThemeProvider>
	);
	/** types into the note next to the grid */
	const typeNote = (text: string) => {
		const note = screen.getByRole<HTMLInputElement>("textbox", {
			name: "Note",
		});
		fireEvent.change(note, { target: { value: text } });
		return note;
	};
	/** the search fields of the grids: the text boxes other than the note */
	const gridSearches = () =>
		screen
			.getAllByRole<HTMLInputElement>("textbox")
			.filter((box) => box.getAttribute("aria-label") !== "Note");
	/** the grid's search field */
	const gridSearch = () => {
		const [search] = gridSearches();
		expect(search).toBeDefined();
		return search;
	};

	it("[ISSUE-3496-ITEM-16] what is inside StorageManagerPersist renders while the stored state loads, with a Loader in the grid's place", async () => {
		const storage = new HeldProvider();
		storage.data[keyOf(FILTERS, { model: "a" })] = JSON.stringify(STORED);
		storage.held = true;
		StorageManager.configure((_id, keys) => [storage, keys]);
		render(smp({ model: "a" }));
		await waitFor(() => expect(storage.waiting).toHaveLength(2));

		expect(screen.getByRole("heading", { name: "People" })).toBeVisible();
		expect(screen.getByRole("textbox", { name: "Note" })).toBeVisible();
		expect(screen.getByRole("progressbar")).toBeInTheDocument();
		expect(grid).toBeNull();

		await act(async () => {
			storage.release();
			await Promise.resolve();
		});
		await gridIdle();
		expect(grid!.state.search).toBe("stored");
		expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
	});

	it("[ISSUE-3496-ITEM-16] a grid under StorageManagerPersist opens in the first render when both buckets answer synchronously", () => {
		localStorage.setItem(
			localKeyOf(FILTERS, { model: "a" }),
			JSON.stringify(STORED),
		);
		render(smp({ model: "a" }));
		expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
		expect(grid!.state.search).toBe("stored");
		expect(gridSearch()).toHaveValue("stored");
	});

	it("[ISSUE-3496-ITEM-16] in StrictMode, a grid under StorageManagerPersist opens in the first render when both buckets answer synchronously, and writes nothing when it opens", async () => {
		localStorage.setItem(
			localKeyOf(FILTERS, { model: "a" }),
			JSON.stringify(STORED),
		);
		const setItem = vi.spyOn(LocalStorageProviderInstance, "setItem");
		render(<StrictMode>{smp({ model: "a" })}</StrictMode>);
		expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
		expect(grid!.state.search).toBe("stored");
		await gridIdle();
		expect(setItem).not.toHaveBeenCalled();
	});

	it("[ISSUE-3496-ITEM-16] a StorageManagerPersist storageKeys change mounts only the grids again: what else is inside keeps its state", async () => {
		const storage = new HeldProvider();
		storage.data[keyOf(FILTERS, { model: "b" })] = JSON.stringify(STORED);
		StorageManager.configure((_id, keys) => [storage, keys]);
		const { rerender } = render(smp({ model: "a" }));
		await gridIdle();
		const note = typeNote("Call back");
		const search = gridSearch();

		storage.held = true;
		grid = null;
		rerender(smp({ model: "b" }));
		await waitFor(() => expect(storage.waiting).toHaveLength(2));
		expect(screen.getByRole("progressbar")).toBeInTheDocument();
		expect(search).not.toBeInTheDocument();
		await act(async () => {
			storage.release();
			await Promise.resolve();
		});
		await gridIdle();
		expect(grid!.state.search).toBe("stored");
		expect(screen.getByRole("textbox", { name: "Note" })).toBe(note);
		expect(note).toHaveValue("Call back");
	});

	it("[ISSUE-3496-ITEM-16] a LocalStoragePersist storageKey change mounts only the grids again: what else is inside keeps its state", async () => {
		localStorage.setItem("grid-b", JSON.stringify(STORED));
		const { rerender } = render(lsp("grid-a"));
		await gridIdle();
		const note = typeNote("Call back");
		const search = gridSearch();

		grid = null;
		rerender(lsp("grid-b"));
		await gridIdle();
		expect(search).not.toBeInTheDocument();
		expect(grid!.state.search).toBe("stored");
		expect(screen.getByRole("textbox", { name: "Note" })).toBe(note);
		expect(note).toHaveValue("Call back");
	});

	it("[ISSUE-3496-ITEM-16] a grid under DataGridNoPersist inside StorageManagerPersist opens while the provider loads, and stays mounted when its storage keys change", async () => {
		const storage = new HeldProvider();
		storage.held = true;
		StorageManager.configure((_id, keys) => [storage, keys]);
		const unpersisted = (
			<NoPersist>
				<Grid />
			</NoPersist>
		);
		const { rerender } = render(smp({ model: "a" }, unpersisted));
		await waitFor(() => expect(storage.waiting).toHaveLength(2));
		expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
		await gridIdle();
		act(() => grid!.setState((prev) => ({ ...prev, search: "typed" })));
		const search = gridSearch();

		rerender(smp({ model: "b" }, unpersisted));
		await waitFor(() => expect(storage.waiting).toHaveLength(4));
		expect(gridSearch()).toBe(search);
		expect(grid!.state.search).toBe("typed");
		await act(async () => {
			storage.release();
			await Promise.resolve();
		});
		expect(gridSearch()).toBe(search);
		expect(storage.writes).toEqual([]);
	});

	it("[ISSUE-3496-ITEM-16] keyboard focus in the second of two grids moves to the second grid mounted for the new storage keys", async () => {
		const twoGrids = (
			<>
				<Grid />
				<Grid />
			</>
		);
		const { rerender } = render(lsp("grid-a", twoGrids));
		await gridIdle();
		const [, second] = gridSearches();
		act(() => second.focus());
		expect(second).toHaveFocus();

		rerender(lsp("grid-b", twoGrids));
		await gridIdle();
		const searches = gridSearches();
		expect(searches).toHaveLength(2);
		expect(searches).not.toContain(second);
		expect(searches[1]).toHaveFocus();
	});
});
