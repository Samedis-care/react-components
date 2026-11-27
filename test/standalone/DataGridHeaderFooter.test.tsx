import React from "react";
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
	within,
} from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import { Refresh, Tune } from "@mui/icons-material";
import type { SvgIconComponent } from "@mui/icons-material";
import { computeAccessibleName } from "dom-accessibility-api";
import ccI18n from "../../src/i18n";
import DataGrid, {
	DataGridData,
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
import type { IDataGridFilterBarProps } from "../../src/standalone/DataGrid/Header/FilterBar";
import type { IDataGridExporter } from "../../src/standalone/DataGrid/Header";
import userEvent from "@testing-library/user-event";

// The header, the footer and the column settings: what the user sees around
// the rows. MultiGrid reports the rendered rows as state.pages on every
// render; without it the tests own the paging (as in DataGridCore.test.tsx).
vi.mock("../../src/standalone/Virtualized/MultiGrid", () => ({
	default: () => null,
}));

// matchMedia stub: evaluates (min-width:Npx)/(max-width:Npx) against a fake
// viewport width and notifies MUI's useMediaQuery subscriptions on resizeTo()
let viewportWidth = 1200;

const mediaListeners = new Set<() => void>();

const evaluateQuery = (query: string) => {
	const max = /max-width:\s*([\d.]+)px/.exec(query);
	const min = /min-width:\s*([\d.]+)px/.exec(query);
	if (!max && !min) return false;
	return (
		(!max || viewportWidth <= parseFloat(max[1])) &&
		(!min || viewportWidth >= parseFloat(min[1]))
	);
};

/** md and up: 1200, sm: 700, xs (a phone): 320 */
const stubViewport = (width: number) => {
	viewportWidth = width;
};

const resizeTo = (width: number) =>
	act(() => {
		viewportWidth = width;
		mediaListeners.forEach((cb) => cb());
	});

beforeAll(async () => {
	await ccI18n.init();
	await ccI18n.changeLanguage("en");
	Object.defineProperty(window, "matchMedia", {
		configurable: true,
		value: (query: string) =>
			({
				get matches() {
					return evaluateQuery(query);
				},
				media: query,
				onchange: null,
				addListener: (cb: () => void) => mediaListeners.add(cb),
				removeListener: (cb: () => void) => mediaListeners.delete(cb),
				addEventListener: (_type: string, cb: () => void) =>
					mediaListeners.add(cb),
				removeEventListener: (_type: string, cb: () => void) =>
					mediaListeners.delete(cb),
				dispatchEvent: () => false,
			}) as unknown as MediaQueryList,
	});
	window.ResizeObserver ??= class {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as never;
});

beforeEach(() => {
	stubViewport(1200);
});

afterEach(async () => {
	cleanup();
	vi.useRealTimers();
	vi.restoreAllMocks();
	probe = null;
	mediaListeners.clear();
	if (ccI18n.language !== "en") await ccI18n.changeLanguage("en");
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
const loadSpy = (impl: (p: IDataGridLoadDataParameters) => DataGridData = ok) =>
	vi.fn<(p: IDataGridLoadDataParameters) => DataGridData>(impl);
const NAME_FILTER = { type: "contains" as const, value1: "b", value2: "" };

type Probe = {
	state: IDataGridState;
	setState: React.Dispatch<React.SetStateAction<IDataGridState>>;
	columnState: IDataGridColumnsState;
	setColumnState: React.Dispatch<React.SetStateAction<IDataGridColumnsState>>;
	widths: Record<string, number>;
	setWidths: React.Dispatch<React.SetStateAction<Record<string, number>>>;
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
	const [widths, setWidths] = useDataGridColumnsWidthState();
	probe = { state, setState, columnState, setColumnState, widths, setWidths };
	return null;
});

/**
 * The grid with the probe as its filter bar (pass filterBar: undefined to
 * leave it out). The header, its search and the footer get test classes.
 */
const Grid = ({ classes, ...props }: Partial<DataGridProps>) => (
	<ThemeProvider theme={theme}>
		<DataGrid
			columns={COLUMNS}
			loadData={ok}
			filterBar={ProbeBar}
			// the bar has no width in jsdom: 0 keeps it in the header
			enableFilterDialogWidth={0}
			classes={{
				header: "test-header",
				search: "test-search",
				footer: "test-footer",
				...classes,
			}}
			{...props}
		/>
	</ThemeProvider>
);

/** no load running or queued */
const idle = () =>
	waitFor(() => expect(probe?.state.refreshData).toBe(0), { timeout: 3000 });
/** past the 500ms debounce of the reload after a query change */
const passDebounce = () => act(() => void vi.advanceTimersByTime(700));

const deferred = <T,>() => {
	let resolve!: (v: T) => void;
	let reject!: (e: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
};

const select = (selectedRows: string[], selectAll = false) =>
	act(() =>
		probe!.setState((p) => ({
			...p,
			selectAll,
			selectedRows,
			selectionUpdatedByProps: false,
		})),
	);

describe("footer actions", () => {
	it("[ISSUE-3495-ITEM-4] Delete keeps the selection when onDelete returns or resolves false, as nothing was deleted", async () => {
		let pending = deferred<boolean | void>();
		const onDelete = vi.fn<NonNullable<DataGridProps["onDelete"]>>(
			() => pending.promise,
		);
		render(<Grid onDelete={onDelete} />);
		await idle();
		select(["1", "2"]);
		const del = screen.getByRole("button", { name: "Delete" });
		/** clicks Delete, then lets onDelete resolve with the value */
		const deleteAndResolve = async (value: boolean | void) => {
			pending = deferred<boolean | void>();
			fireEvent.click(del);
			await act(async () => {
				pending.resolve(value);
				// the footer awaited the promise first, so it has handled it by now
				await pending.promise;
			});
		};

		await deleteAndResolve(false);
		expect(onDelete).toHaveBeenCalledTimes(1);
		expect(probe!.state.selectedRows, "resolved false").toEqual(["1", "2"]);
		expect(del).toBeEnabled();

		onDelete.mockReturnValueOnce(false);
		await act(async () => {
			fireEvent.click(del);
			await Promise.resolve();
		});
		expect(onDelete).toHaveBeenCalledTimes(2);
		expect(probe!.state.selectedRows, "returned false").toEqual(["1", "2"]);

		// anything else is a delete that ran: the selection is cleared
		await deleteAndResolve(undefined);
		expect(onDelete).toHaveBeenCalledTimes(3);
		expect(probe!.state.selectedRows).toEqual([]);
		// unavailable, but still focusable since ISSUE-3495-ITEM-16
		expect(del).toHaveAttribute("aria-disabled", "true");
	});
	it("[ISSUE-3495-ITEM-24] a page load does not re-render the action bar, and a custom button still gets the rows loaded meanwhile", async () => {
		const people: DataGridRowData[] = [
			...ROWS,
			{ id: "3", name: "Carol", role: "user" },
			{ id: "4", name: "Dave", role: "admin" },
		];
		const loadData: DataGridProps["loadData"] = ({ page, rows }) => ({
			rowsTotal: people.length,
			rows: people.slice((page - 1) * rows, page * rows),
		});
		// the action bar asks on every render
		const isDisabled = vi.fn(() => false);
		const onClick = vi.fn();
		render(
			<Grid
				rowsPerPage={2}
				loadData={loadData}
				customDataActionButtons={[
					{ icon: <Tune />, label: "Archive", isDisabled, onClick },
				]}
			/>,
		);
		await idle();
		select(["1", "3"]);
		isDisabled.mockClear();
		// the user scrolls down to the second page
		act(() => probe!.setState((p) => ({ ...p, pages: [0, 1] })));
		await waitFor(() => expect(Object.keys(probe!.state.rows)).toHaveLength(4));
		await idle();
		expect(isDisabled).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("button", { name: "Archive" }));
		expect(onClick).toHaveBeenCalledExactlyOnceWith(
			false,
			["1", "3"],
			expect.objectContaining({ count: 2, rows: [people[0], people[2]] }),
		);
	});
	it("[ISSUE-3506-ITEM-11] while deleting, Delete keeps focus but is unavailable and shows its progress, and the footer's actions are busy", async () => {
		const onDelete = vi.fn();
		const { rerender } = render(<Grid onDelete={onDelete} deleting />);
		await idle();
		select(["1"]);
		const del = screen.getByRole("button", { name: "Delete" });
		del.focus();
		expect(del).toHaveAttribute("aria-disabled", "true");
		expect(within(del).getByRole("progressbar")).toHaveAccessibleName("Delete");
		expect(del.closest("[aria-busy=true]")).not.toBeNull();
		fireEvent.click(del);
		expect(onDelete).not.toHaveBeenCalled();

		rerender(<Grid onDelete={onDelete} deleting={false} />);
		expect(del).toHaveFocus();
		expect(del).not.toHaveAttribute("aria-disabled");
		expect(within(del).queryByRole("progressbar")).toBeNull();
		expect(document.querySelector("[aria-busy=true]")).toBeNull();
		fireEvent.click(del);
		expect(onDelete).toHaveBeenCalledOnce();
	});
});

const header = () => document.querySelector<HTMLElement>(".test-header")!;

const footer = () => document.querySelector<HTMLElement>(".test-footer")!;

describe("search", () => {
	it("[ISSUE-3495-ITEM-18] on a phone the search popover puts focus into its field and the button exposes the popover", async () => {
		stubViewport(320);
		render(<Grid filterBar={undefined} />);
		const search = await screen.findByRole("button", { name: "Search" });
		fireEvent.click(search);
		const field = await screen.findByRole("textbox");
		await waitFor(() => expect(field).toHaveFocus());
		expect(search).toHaveAttribute("aria-expanded", "true");
		expect(search).toHaveAttribute("aria-haspopup");
	});

	it("[ISSUE-3495-ITEM-18] on a phone the popover is a dialog named after the Search button, which controls it while it is open", async () => {
		stubViewport(320);
		render(<Grid filterBar={undefined} />);
		const search = await screen.findByRole("button", { name: "Search" });
		expect(search).toHaveAttribute("aria-haspopup", "dialog");
		expect(search).toHaveAttribute("aria-expanded", "false");
		expect(search).not.toHaveAttribute("aria-controls");
		fireEvent.click(search);
		const dialog = await screen.findByRole("dialog", { name: "Search" });
		expect(dialog).toHaveAttribute("aria-modal", "true");
		expect(search).toHaveAttribute("aria-controls", dialog.id);
		const field = within(dialog).getByRole("textbox");
		fireEvent.keyDown(field, { key: "Escape" });
		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
		);
		expect(search).toHaveAttribute("aria-expanded", "false");
		expect(search).not.toHaveAttribute("aria-controls");
	});

	it("[ISSUE-3495-ITEM-18] the search field of the wider layouts does not take focus when the grid mounts", async () => {
		render(<Grid />);
		await idle();
		expect(within(header()).getByRole("textbox")).not.toHaveFocus();
	});
});

/** The column settings panel (with MultiGrid mocked, the only table) */
const settingsPanel = () =>
	document.querySelector("table")!.closest<HTMLElement>(".MuiPaper-root")!;

const settingsRows = () =>
	Array.from(
		settingsPanel().querySelectorAll("tbody tr"),
		(row) => row.querySelector("td, th")!.textContent,
	);

const searchBox = () => within(header()).getByRole("textbox");

const typeSearch = (value: string) =>
	act(() => void fireEvent.change(searchBox(), { target: { value } }));

describe("column settings", () => {
	const openSettings = () =>
		fireEvent.click(screen.getByRole("button", { name: "Columns" }));
	it("[ISSUE-3495-ITEM-2] the column search ignores case", async () => {
		render(<Grid />);
		await idle();
		openSettings();
		typeSearch("Name");
		expect(settingsRows()).toEqual(["Name"]);
	});
	it("[ISSUE-3495-ITEM-2] the column search ignores leading and trailing spaces, and case in letters with umlauts", async () => {
		const columns: IDataGridColumnDef[] = [
			{ field: "device", headerName: "Gerätename", type: "string" },
			{ field: "maker", headerName: "Hersteller", type: "string" },
		];
		render(<Grid columns={columns} />);
		await idle();
		openSettings();
		typeSearch("  GERÄT ");
		expect(settingsRows()).toEqual(["Gerätename"]);
		typeSearch("hersteller");
		expect(settingsRows()).toEqual(["Hersteller"]);
		// only spaces: no filter
		typeSearch("   ");
		expect(settingsRows()).toEqual(["Gerätename", "Hersteller"]);
		// the box keeps what was typed
		expect(searchBox()).toHaveValue("   ");
	});
	it("[ISSUE-3495-ITEM-13] each checkbox is named with its column, and the column name is the row header", async () => {
		const columns: IDataGridColumnDef[] = [
			...COLUMNS,
			{ field: "id", headerName: "ID", type: "string", forcePin: true },
		];
		render(<Grid columns={columns} />);
		await idle();
		openSettings();
		const panel = within(settingsPanel());
		expect(
			panel.getAllByRole("rowheader").map((cell) => cell.textContent),
		).toEqual(["ID", "Name", "Role"]);
		expect(
			panel.getByRole("checkbox", { name: /Visible.*Name|Name.*Visible/ }),
		).toBeChecked();
		const pinId = panel.getByRole("checkbox", { name: /Pin.*ID|ID.*Pin/ });
		expect(pinId).toBeDisabled();
		// why it cannot be changed
		expect(pinId).toHaveAccessibleDescription();
	});
	it("[ISSUE-3495-ITEM-13] the Pin of a hidden column says why it cannot be changed, and the table is named", async () => {
		const columns: IDataGridColumnDef[] = [
			...COLUMNS,
			{ field: "id", headerName: "ID", type: "string", forcePin: true },
		];
		render(<Grid columns={columns} />);
		await idle();
		openSettings();
		const panel = within(settingsPanel());
		expect(panel.getByRole("table")).toHaveAccessibleName("Columns");
		expect(
			panel.getByRole("checkbox", { name: "Pin ID" }),
		).toHaveAccessibleDescription("This column is always pinned");
		const visibleRole = panel.getByRole("checkbox", { name: "Visible Role" });
		const pinRole = panel.getByRole("checkbox", { name: "Pin Role" });
		expect(pinRole).toBeEnabled();
		expect(pinRole).not.toHaveAccessibleDescription();
		fireEvent.click(visibleRole);
		expect(pinRole).toBeDisabled();
		expect(pinRole).toHaveAccessibleDescription(
			"Hidden columns cannot be pinned",
		);
		fireEvent.click(visibleRole);
		expect(pinRole).toBeEnabled();
		expect(pinRole).not.toHaveAccessibleDescription();
		expect(visibleRole).not.toHaveAccessibleDescription();
	});
	it("[ISSUE-3495-ITEM-13] the names and the reasons are translated", async () => {
		await ccI18n.changeLanguage("de");
		const columns: IDataGridColumnDef[] = [
			...COLUMNS,
			{ field: "id", headerName: "ID", type: "string", forcePin: true },
			{ field: "notes", headerName: "Notes", type: "string", hidden: true },
		];
		render(<Grid columns={columns} />);
		await idle();
		fireEvent.click(screen.getByRole("button", { name: "Spalten" }));
		const panel = within(settingsPanel());
		expect(panel.getByRole("table")).toHaveAccessibleName("Spalten");
		expect(
			panel.getByRole("checkbox", { name: "Sichtbar Notes" }),
		).not.toBeChecked();
		expect(
			panel.getByRole("checkbox", { name: "Anheften ID" }),
		).toHaveAccessibleDescription("Diese Spalte ist immer angeheftet");
		expect(
			panel.getByRole("checkbox", { name: "Anheften Notes" }),
		).toHaveAccessibleDescription(
			"Ausgeblendete Spalten können nicht angeheftet werden",
		);
	});
	it("[ISSUE-3495-ITEM-19] in settings mode the search box says that it searches the columns", async () => {
		render(<Grid searchPlaceholder={"Search people"} />);
		await idle();
		expect(searchBox()).toHaveAttribute("placeholder", "Search people");
		openSettings();
		const field = searchBox();
		const purpose = `${field.getAttribute("placeholder") ?? ""} ${
			field.getAttribute("aria-label") ?? ""
		}`;
		expect(purpose).toMatch(/column/i);
	});
	it("[ISSUE-3495-ITEM-19] the search box is named and labelled Search columns while the settings are open, and gets the grid's placeholder back when they close", async () => {
		render(<Grid searchPlaceholder={"Search people"} />);
		await idle();
		openSettings();
		expect(searchBox()).toHaveAccessibleName("Search columns");
		expect(searchBox()).toHaveAttribute("placeholder", "Search columns");
		fireEvent.click(
			within(settingsPanel()).getByRole("button", { name: "Close" }),
		);
		expect(searchBox()).toHaveAttribute("placeholder", "Search people");
		expect(searchBox()).not.toHaveAccessibleName("Search columns");
	});
	it("[ISSUE-3495-ITEM-19] a column search without a match shows a row that says so, announced by a polite status", async () => {
		render(<Grid />);
		await idle();
		openSettings();
		const panel = within(settingsPanel());
		// the live region is there, empty, before the result changes
		const status = panel.getByRole("status");
		expect(status).toBeEmptyDOMElement();
		typeSearch("zzz");
		expect(panel.getByRole("cell", { name: "No matching column" })).toBe(
			settingsPanel().querySelector("tbody td"),
		);
		expect(panel.getByRole("status")).toBe(status);
		expect(status).toHaveTextContent("No matching column");
		typeSearch("na");
		expect(
			panel.queryByRole("cell", { name: "No matching column" }),
		).toBeNull();
		expect(status).toBeEmptyDOMElement();
	});
	it("[ISSUE-3495-ITEM-19] applies classes.settingsStatus to the status", async () => {
		render(<Grid classes={{ settingsStatus: "my-status" }} />);
		await idle();
		openSettings();
		expect(within(settingsPanel()).getByRole("status")).toHaveClass(
			"my-status",
		);
	});
	it("[ISSUE-3495-ITEM-19] on a phone the Search button says that it searches the columns while the settings are open", async () => {
		stubViewport(320);
		render(<Grid filterBar={undefined} />);
		await screen.findByRole("button", { name: "Search" });
		openSettings();
		fireEvent.click(screen.getByRole("button", { name: "Search columns" }));
		const field = await screen.findByRole("textbox", {
			name: "Search columns",
		});
		expect(field).toHaveAttribute("placeholder", "Search columns");
	});
	it("[ISSUE-3495-ITEM-24] the closed settings panel does not re-sort its columns while the user types a search", async () => {
		render(<Grid />);
		await idle();
		const compare = vi.spyOn(String.prototype, "localeCompare");
		for (const value of ["a", "ab", "abc"]) typeSearch(value);
		expect(compare).not.toHaveBeenCalled();
	});
	it("[ISSUE-3495-ITEM-24] the closed settings panel does not re-render its table while the user types a search", async () => {
		let reads = 0;
		// each row of the settings table shows its column's headerName
		const columns: IDataGridColumnDef[] = COLUMNS.map((column) => ({
			...column,
			get headerName() {
				reads++;
				return column.headerName;
			},
		}));
		render(<Grid columns={columns} />);
		await idle();
		reads = 0;
		for (const value of ["a", "ab", "abc"]) typeSearch(value);
		expect(reads).toBe(0);
	});
});

const openMenu = async (trigger: string, item?: string) => {
	fireEvent.click(screen.getByRole("button", { name: trigger }));
	if (item)
		fireEvent.click(await screen.findByRole("menuitem", { name: item }));
};

describe("reset menu", () => {
	it("[ISSUE-3495-ITEM-3] Reset column settings that hides a filtered column again drops its filter, as hiding it in the settings does", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		const loadData = loadSpy();
		const columns = [COLUMNS[0], { ...COLUMNS[1], hidden: true }];
		render(<Grid loadData={loadData} columns={columns} />);
		await idle();
		// the user shows "role" in the settings and filters it
		act(() =>
			probe!.setState((p) => ({
				...p,
				columnHidden: { ...p.columnHidden, role: false },
			})),
		);
		act(() =>
			probe!.setColumnState((p) => ({
				...p,
				role: {
					...p.role,
					filter: { type: "contains", value1: "adm", value2: "" },
				},
			})),
		);
		passDebounce();
		await idle();

		await openMenu("Reset", "Reset column settings");
		passDebounce();
		await idle();
		expect(probe!.state.columnHidden.role).toBe(true);
		// what the next load asks for: nothing of the column the user can't see
		expect(probe!.columnState.role.filter).toBeUndefined();
	});

	it("[ISSUE-3495-ITEM-3] after Reset column settings drops a filter, the grid loads once, without the filter of the column hidden again", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		const loadData = loadSpy();
		const columns = [COLUMNS[0], { ...COLUMNS[1], hidden: true }];
		render(<Grid loadData={loadData} columns={columns} />);
		await idle();
		// the user shows "role" and filters it and "name"
		act(() =>
			probe!.setState((p) => ({
				...p,
				columnHidden: { ...p.columnHidden, role: false },
			})),
		);
		act(() =>
			probe!.setColumnState((p) => ({
				...p,
				name: { ...p.name, filter: NAME_FILTER },
				role: {
					...p.role,
					filter: { type: "contains", value1: "adm", value2: "" },
				},
			})),
		);
		passDebounce();
		await idle();
		expect(Object.keys(loadData.mock.lastCall![0].fieldFilter)).toEqual([
			"name",
			"role",
		]);
		loadData.mockClear();

		await openMenu("Reset", "Reset column settings");
		passDebounce();
		await idle();
		passDebounce();
		await idle();
		expect(loadData).toHaveBeenCalledOnce();
		expect(Object.keys(loadData.mock.lastCall![0].fieldFilter)).toEqual([
			"name",
		]);
	});

	it("[ISSUE-3495-ITEM-3] Reset column settings keeps the filters of the columns it leaves visible, and does not reload when it drops no filter", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		const loadData = loadSpy();
		const columns = [COLUMNS[0], { ...COLUMNS[1], hidden: true }];
		render(<Grid loadData={loadData} columns={columns} />);
		await idle();
		// the user shows "role" without filtering it, pins "name" and filters it
		act(() =>
			probe!.setState((p) => ({
				...p,
				columnHidden: { ...p.columnHidden, role: false },
				columnPinned: { ...p.columnPinned, name: true },
			})),
		);
		act(() =>
			probe!.setColumnState((p) => ({
				...p,
				name: { ...p.name, filter: NAME_FILTER },
			})),
		);
		passDebounce();
		await idle();
		loadData.mockClear();

		await openMenu("Reset", "Reset column settings");
		passDebounce();
		await idle();
		expect(probe!.state.columnHidden.role).toBe(true);
		expect(probe!.state.columnPinned.name).toBe(false);
		expect(probe!.columnState.name.filter).toEqual(NAME_FILTER);
		expect(loadData).not.toHaveBeenCalled();
	});
});

const makeExporter = (
	over: Partial<IDataGridExporter<unknown>> = {},
): IDataGridExporter<unknown> => ({
	id: "xlsx",
	getLabel: () => "Excel",
	getWorkingLabel: () => "Working",
	getReadyLabel: () => "Ready",
	getErrorLabel: () => "Failed",
	onRequest: vi.fn(() => Promise.resolve({ file: 1 })),
	onDownload: vi.fn(),
	...over,
});

describe("export", () => {
	it("[ISSUE-3495-ITEM-5] autoDownload hands onDownload the data just requested", async () => {
		let n = 0;
		const onDownload = vi.fn<(data: unknown) => void>();
		const exporter = makeExporter({
			onRequest: vi.fn(() => Promise.resolve({ file: ++n })),
			onDownload,
			autoDownload: true,
		});
		render(<Grid exporters={[exporter]} />);
		await idle();
		await openMenu("Export", "Excel");
		await waitFor(() => expect(onDownload).toHaveBeenCalledTimes(1));
		await waitFor(() =>
			expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
		);
		await openMenu("Export", "Excel");
		await waitFor(() => expect(onDownload).toHaveBeenCalledTimes(2));
		expect(onDownload.mock.calls.map((call) => call[0])).toEqual([
			{ file: 1 },
			{ file: 2 },
		]);
	});

	it("[ISSUE-3495-ITEM-15] the working entry is marked unavailable, and the ready entry is announced", async () => {
		const request = deferred<unknown>();
		render(
			<Grid
				exporters={[makeExporter({ onRequest: vi.fn(() => request.promise) })]}
			/>,
		);
		await idle();
		await openMenu("Export", "Excel");
		const working = await screen.findByRole("menuitem", { name: "Working" });
		expect(working).toHaveAttribute("aria-disabled", "true");
		await act(async () => {
			request.resolve({});
			await request.promise;
		});
		await screen.findByRole("menuitem", { name: "Ready" });
		expect(
			screen
				.getAllByRole("status")
				.some((region) => region.textContent?.includes("Ready")),
		).toBe(true);
	});

	it("[ISSUE-3495-ITEM-15] the spinner of the working entry is hidden from assistive technology, its label names the entry", async () => {
		render(
			<Grid
				exporters={[
					makeExporter({ onRequest: vi.fn(() => new Promise(() => {})) }),
				]}
			/>,
		);
		await idle();
		await openMenu("Export", "Excel");
		const working = await screen.findByRole("menuitem", { name: "Working" });
		expect(working.querySelector(".MuiCircularProgress-root")).toHaveAttribute(
			"aria-hidden",
			"true",
		);
		expect(within(working).queryByRole("progressbar")).not.toBeInTheDocument();
	});

	it("[ISSUE-3495-ITEM-15] an export that turns ready after the menu was closed is announced by a status that was there before, which empties once it is downloaded", async () => {
		const request = deferred<unknown>();
		const onDownload = vi.fn();
		render(
			<Grid
				exporters={[
					makeExporter({ onRequest: vi.fn(() => request.promise), onDownload }),
				]}
			/>,
		);
		await idle();
		await openMenu("Export", "Excel");
		await screen.findByRole("menuitem", { name: "Working" });
		fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
		await waitFor(() =>
			expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
		);
		const regions = screen.getAllByRole("status");
		expect(regions.map((region) => region.textContent)).not.toContain("Ready");
		await act(async () => {
			request.resolve({ file: 1 });
			await request.promise;
		});
		expect(screen.getAllByRole("status")).toEqual(regions);
		expect(regions.map((region) => region.textContent)).toContain("Ready");
		await openMenu("Export", "Ready");
		expect(onDownload).toHaveBeenCalledOnce();
		await waitFor(() =>
			expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
		);
		expect(regions.map((region) => region.textContent)).not.toContain("Ready");
	});

	it("[ISSUE-3495-ITEM-15] an export that fails after the menu was closed is announced, and the status empties once the failed entry is clicked", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const request = deferred<unknown>();
		render(
			<Grid
				exporters={[makeExporter({ onRequest: vi.fn(() => request.promise) })]}
			/>,
		);
		await idle();
		await openMenu("Export", "Excel");
		await screen.findByRole("menuitem", { name: "Working" });
		fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
		await waitFor(() =>
			expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
		);
		const regions = screen.getAllByRole("status");
		await act(async () => {
			request.reject(new Error("export failed"));
			await request.promise.catch(() => {});
		});
		expect(regions.map((region) => region.textContent)).toContain("Failed");
		await openMenu("Export", "Failed");
		expect(
			await screen.findByRole("menuitem", { name: "Excel" }),
		).toBeInTheDocument();
		// the status outside the menu, and the one inside the open menu
		expect(regions.map((region) => region.textContent)).not.toContain("Failed");
		expect(
			screen
				.getAllByRole("status")
				.some((region) => region.textContent?.includes("Failed")),
		).toBe(false);
	});
});

describe("header action bar", () => {
	it("[ISSUE-3495-ITEM-1] on a phone with a filter bar, More options → Export opens the export menu", async () => {
		stubViewport(320);
		render(<Grid exporters={[makeExporter()]} />);
		await idle();
		await openMenu("More options", "Export");
		expect(
			await screen.findByRole("menuitem", { name: "Excel" }),
		).toBeInTheDocument();
	});

	it("[ISSUE-3495-ITEM-1] a phone's More options → Export does not pop the export menu open after the screen widens", async () => {
		stubViewport(320);
		render(<Grid exporters={[makeExporter()]} />);
		await idle();
		await openMenu("More options", "Export");
		// close whatever opened, as the user does before turning the phone
		fireEvent.keyDown(document.activeElement ?? document.body, {
			key: "Escape",
		});
		await waitFor(() =>
			expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
		);
		resizeTo(1200);
		expect(
			screen.queryByRole("menuitem", { name: "Excel" }),
		).not.toBeInTheDocument();
	});

	it("[ISSUE-3495-ITEM-1] a ready export stays ready across the switch between the wide layout and the phone's More options", async () => {
		render(<Grid exporters={[makeExporter()]} />);
		await idle();
		await openMenu("Export", "Excel");
		expect(
			await screen.findByRole("menuitem", { name: "Ready" }),
		).toBeInTheDocument();
		fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
		await waitFor(() =>
			expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
		);
		resizeTo(320);
		await openMenu("More options", "Export");
		expect(
			await screen.findByRole("menuitem", { name: "Ready" }),
		).toBeInTheDocument();
		fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
		await waitFor(() =>
			expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
		);
		resizeTo(1200);
		await openMenu("Export");
		expect(
			await screen.findByRole("menuitem", { name: "Ready" }),
		).toBeInTheDocument();
	});
});

/** what an svg draws, its viewBox and path data: tells the icons apart */
const glyphOf = (svg: SVGSVGElement | null | undefined) => ({
	viewBox: svg?.getAttribute("viewBox"),
	paths: Array.from(svg?.querySelectorAll("path") ?? [], (path) =>
		path.getAttribute("d"),
	),
});

/** the glyph of a Material icon */
const materialGlyph = (Icon: SvgIconComponent) => {
	const { container, unmount } = render(<Icon />);
	const glyph = glyphOf(container.querySelector("svg"));
	unmount();
	return glyph;
};

describe("header action bar icons", () => {
	it.each([
		["a wide screen", 1200],
		["a tablet", 700],
	])(
		"[ISSUE-3460-ITEM-12] on %s the Columns and Reset buttons show MUI's Tune and Refresh",
		async (_screen, width) => {
			stubViewport(width);
			const tune = materialGlyph(Tune);
			const refresh = materialGlyph(Refresh);
			render(<Grid />);
			await idle();
			const columns = screen.getByRole("button", { name: "Columns" });
			const reset = screen.getByRole("button", { name: "Reset" });
			expect(glyphOf(columns.querySelector("svg"))).toEqual(tune);
			expect(glyphOf(reset.querySelector("svg"))).toEqual(refresh);
		},
	);

	it("[ISSUE-3460-ITEM-12] on a phone, More options shows MUI's Tune for Columns and Refresh for Reset", async () => {
		stubViewport(320);
		const tune = materialGlyph(Tune);
		const refresh = materialGlyph(Refresh);
		render(<Grid />);
		await idle();
		await openMenu("More options");
		const columns = await screen.findByRole("menuitem", { name: "Columns" });
		const reset = screen.getByRole("menuitem", { name: "Reset" });
		expect(glyphOf(columns.querySelector("svg"))).toEqual(tune);
		expect(glyphOf(reset.querySelector("svg"))).toEqual(refresh);
	});
});

/**
 * What assistive technology learns from a button that opens a menu, before and
 * while the menu is open: the button says that it opens a menu, aria-expanded
 * follows the menu, aria-controls is the menu's id while it is open, and the
 * menu is named by the button
 * @param trigger The button that opens the menu
 * @param item The name of an item of that menu
 */
const menuButtonState = async (trigger: HTMLElement, item: string) => {
	const attributes = () => ({
		"aria-haspopup": trigger.getAttribute("aria-haspopup"),
		"aria-expanded": trigger.getAttribute("aria-expanded"),
	});
	const closed = {
		...attributes(),
		"aria-controls": trigger.getAttribute("aria-controls"),
	};
	fireEvent.click(trigger);
	const menu = (await screen.findByRole("menuitem", { name: item })).closest(
		"[role='menu']",
	)!;
	return {
		closed,
		open: {
			...attributes(),
			"aria-controls is the menu's id":
				menu.id !== "" && trigger.getAttribute("aria-controls") === menu.id,
			"the menu's name": computeAccessibleName(menu),
		},
	};
};

const menuButtonExpected = (name: string) => ({
	closed: {
		"aria-haspopup": "menu",
		"aria-expanded": "false",
		"aria-controls": null,
	},
	open: {
		"aria-haspopup": "menu",
		"aria-expanded": "true",
		"aria-controls is the menu's id": true,
		"the menu's name": name,
	},
});

const customActions: DataGridProps["customDataActionButtons"] = [
	{
		icon: <Tune />,
		label: "Archive",
		isDisabled: () => false,
		onClick: () => {},
	},
	{
		icon: <Refresh />,
		label: "Copy",
		isDisabled: () => false,
		onClick: () => {},
	},
];

describe("menu buttons", () => {
	it.each([
		["a wide screen", "Reset", 1200, "Refresh"],
		["a wide screen", "Export", 1200, "Excel"],
		["a tablet", "Reset", 700, "Refresh"],
		["a tablet", "Export", 700, "Excel"],
	])(
		"[ISSUE-3459-ITEM-11] on %s the %s button announces its menu and names it",
		async (_screen, trigger, width, item) => {
			stubViewport(width);
			render(<Grid exporters={[makeExporter()]} />);
			await idle();
			expect(
				await menuButtonState(
					screen.getByRole("button", { name: trigger }),
					item,
				),
			).toEqual(menuButtonExpected(trigger));
		},
	);

	it("[ISSUE-3459-ITEM-11] on a phone with a filter bar, More options announces its menu and names it", async () => {
		stubViewport(320);
		render(<Grid exporters={[makeExporter()]} />);
		await idle();
		expect(
			await menuButtonState(
				screen.getByRole("button", { name: "More options" }),
				"Columns",
			),
		).toEqual(menuButtonExpected("More options"));
		// its Reset and Export entries open menus, Columns does not
		expect(
			["Columns", "Reset", "Export"].map((name) =>
				screen.getByRole("menuitem", { name }).getAttribute("aria-haspopup"),
			),
		).toEqual([null, "menu", "menu"]);
	});

	it.each([
		["Reset", "Refresh"],
		["Export", "Excel"],
	])(
		"[ISSUE-3459-ITEM-11] on a phone with a filter bar, the %s menu opened from More options is named after its entry",
		async (entry, item) => {
			stubViewport(320);
			render(<Grid exporters={[makeExporter()]} />);
			await idle();
			await openMenu("More options", entry);
			const menu = (
				await screen.findByRole("menuitem", { name: item })
			).closest("[role='menu']")!;
			expect(computeAccessibleName(menu)).toBe(entry);
		},
	);

	it("[ISSUE-3459-ITEM-11] on a phone the footer's More announces its menu and names it", async () => {
		stubViewport(320);
		render(<Grid customDataActionButtons={customActions} />);
		await idle();
		expect(
			await menuButtonState(
				screen.getByRole("button", { name: "More" }),
				"Archive",
			),
		).toEqual(menuButtonExpected("More"));
	});
});

describe("row counts", () => {
	const counts =
		(rowsTotal: number, rowsFiltered?: number) => (): DataGridData => ({
			rowsTotal,
			rowsFiltered,
			rows: ROWS,
		});
	const countText = () => footer().querySelector(".my-count")!.textContent;
	const CLASSES = { paginationText: "my-count" };

	it("[ISSUE-3495-ITEM-11] groups the digits of large counts", async () => {
		render(<Grid loadData={counts(12345, 1234)} classes={CLASSES} />);
		await idle();
		expect(countText()).toBe("Filtered: 1,234 Total: 12,345");
	});

	it("[ISSUE-3495-ITEM-11] groups the digits of the total alone", async () => {
		render(<Grid loadData={counts(12345)} classes={CLASSES} />);
		await idle();
		expect(countText()).toBe("Total: 12,345");
	});

	it("[ISSUE-3495-ITEM-11] each language groups the digits and spaces the text its own way", async () => {
		render(<Grid loadData={counts(12345, 1234)} classes={CLASSES} />);
		await idle();
		await act(() => ccI18n.changeLanguage("de"));
		expect(countText()).toBe("Gefiltert: 1.234 Gesamt: 12.345");
		// a no-break space before the colon, a narrow one between the groups
		await act(() => ccI18n.changeLanguage("fr"));
		expect(countText()).toBe(
			"Filtré\u00a0: 1\u202f234 Total\u00a0: 12\u202f345",
		);
	});

	it("[ISSUE-3495-ITEM-11] on a phone the digits are grouped too", async () => {
		stubViewport(320);
		render(<Grid loadData={counts(12345, 1234)} classes={CLASSES} />);
		await idle();
		expect(screen.getByText("#1,234/12,345")).toBeVisible();
	});
});

describe("select all", () => {
	it("[ISSUE-3495-ITEM-6] with disableSelection the hidden select all cannot be ticked", async () => {
		const onDelete = vi.fn();
		render(
			<Grid
				disableSelection
				enableSelectAll
				enableDeleteAll
				onDelete={onDelete}
			/>,
		);
		await idle();
		const all = screen.queryByRole("checkbox", { name: "All" });
		if (all) expect(all).toBeDisabled();
	});

	it("[ISSUE-3495-ITEM-6] with prohibitMultiSelect the disabled select all looks disabled", async () => {
		render(<Grid enableSelectAll prohibitMultiSelect />);
		await idle();
		const label = screen
			.getByRole("checkbox", { name: "All" })
			.closest("label")!;
		expect(label).toHaveClass("Mui-disabled");
	});

	it("[ISSUE-3495-ITEM-6] with disableSelection Space cannot tick the hidden select all, so Delete does not delete everything", async () => {
		const user = userEvent.setup();
		const onDelete = vi.fn();
		render(
			<Grid
				disableSelection
				enableSelectAll
				enableDeleteAll
				onDelete={onDelete}
			/>,
		);
		await idle();
		const all = screen.getByRole("checkbox", { name: "All" });
		all.focus();
		expect(all).not.toHaveFocus();
		await user.keyboard(" ");
		expect(all).not.toBeChecked();
		expect(probe!.state.selectAll).toBe(false);
		const del = screen.getByRole("button", { name: "Delete" });
		expect(del).toHaveAttribute("aria-disabled", "true");
		fireEvent.click(del);
		expect(onDelete).not.toHaveBeenCalled();
	});

	it("[ISSUE-3495-ITEM-6] the select all and its caption follow disableSelection and prohibitMultiSelect changed after mount", async () => {
		const all = () => screen.getByRole("checkbox", { name: "All" });
		const caption = () => all().closest("label")!;
		const { rerender } = render(<Grid enableSelectAll disableSelection />);
		await idle();
		expect(all()).toBeDisabled();
		expect(caption()).toHaveClass("Mui-disabled");

		rerender(<Grid enableSelectAll />);
		expect(all()).toBeEnabled();
		expect(caption()).not.toHaveClass("Mui-disabled");

		rerender(<Grid enableSelectAll prohibitMultiSelect />);
		expect(all()).toBeDisabled();
		expect(caption()).toHaveClass("Mui-disabled");

		rerender(<Grid enableSelectAll />);
		expect(all()).toBeEnabled();
		expect(caption()).not.toHaveClass("Mui-disabled");
	});
});

describe("phone layout", () => {
	const onAddNew = () => [
		{ label: "New", onClick: vi.fn() },
		{ label: "Invite", icon: <Tune />, onClick: vi.fn() },
		{ label: "Import list", onClick: undefined, disableHint: "Not allowed" },
	];
	const headerButtons = () =>
		within(header())
			.getAllByRole("button")
			.map((button) => computeAccessibleName(button));
	const archive = customActions.slice(0, 1);

	it("[ISSUE-3495-ITEM-22] on a phone the add buttons after the first are entries of More options, below its other entries", async () => {
		stubViewport(320);
		const buttons = onAddNew();
		render(<Grid filterBar={undefined} onAddNew={buttons} />);
		await screen.findByRole("button", { name: "Search" });
		// the first one stays, named by its label (ActionButton small, ISSUE-3482-ITEM-1)
		expect(headerButtons()).toEqual(["Search", "More options", "New"]);
		await openMenu("More options");
		const menu = await screen.findByRole("menu");
		expect(
			within(menu)
				.getAllByRole("menuitem")
				.map((item) => item.textContent),
		).toEqual(["Columns", "Reset", "Invite", "Import listNot allowed"]);
		expect(within(menu).getByRole("separator")).toBeInTheDocument();
		expect(
			within(menu).getByRole("menuitem", { name: /Import list/ }),
		).toHaveAttribute("aria-disabled", "true");
		fireEvent.click(within(menu).getByRole("menuitem", { name: "Invite" }));
		expect(buttons[1].onClick).toHaveBeenCalledOnce();
		expect(buttons[0].onClick).not.toHaveBeenCalled();
		await waitFor(() =>
			expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
		);
	});

	it("[ISSUE-3495-ITEM-22] on wider screens every add button is in the header", async () => {
		stubViewport(700);
		render(<Grid filterBar={undefined} onAddNew={onAddNew()} />);
		expect(
			await screen.findByRole("button", { name: "Invite" }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "More options" }),
		).not.toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Import list" }),
		).toBeInTheDocument();
	});

	it("[ISSUE-3495-ITEM-22] on a phone Columns and Reset stay beside one add button, a third button beside it moves them into More options", async () => {
		stubViewport(320);
		const { rerender } = render(
			<Grid filterBar={undefined} onAddNew={vi.fn<() => void>()} />,
		);
		await screen.findByRole("button", { name: "Search" });
		expect(headerButtons()).toEqual(["Search", "Columns", "Reset", "New"]);

		rerender(
			<Grid
				filterBar={undefined}
				onAddNew={vi.fn<() => void>()}
				exporters={[makeExporter()]}
			/>,
		);
		expect(headerButtons()).toEqual(["Search", "More options", "New"]);

		// without an add button all four fit
		rerender(
			<Grid
				filterBar={undefined}
				exporters={[makeExporter()]}
				onImport={vi.fn()}
			/>,
		);
		expect(headerButtons()).toEqual([
			"Search",
			"Columns",
			"Reset",
			"Export",
			"Import",
		]);
	});

	it("[ISSUE-3495-ITEM-22] on a phone one custom action is an entry of More when select all, Edit and Delete are in the bar too", async () => {
		stubViewport(320);
		const { rerender } = render(
			<Grid
				enableSelectAll
				onEdit={vi.fn()}
				onDelete={vi.fn()}
				customDataActionButtons={archive}
			/>,
		);
		await idle();
		const bar = within(footer());
		expect(bar.queryByRole("button", { name: "Archive" })).toBeNull();
		await openMenu("More");
		expect(
			await screen.findByRole("menuitem", { name: "Archive" }),
		).toBeInTheDocument();

		// three actions leave room for it
		rerender(
			<Grid
				onEdit={vi.fn()}
				onDelete={vi.fn()}
				customDataActionButtons={archive}
			/>,
		);
		await waitFor(() =>
			expect(bar.getByRole("button", { name: "Archive" })).toBeInTheDocument(),
		);
		expect(bar.queryByRole("button", { name: "More" })).toBeNull();
	});

	it("[ISSUE-3495-ITEM-22] the hidden select all takes no place on a phone, and keeps it on wider screens", async () => {
		stubViewport(320);
		render(<Grid onEdit={vi.fn()} customDataActionButtons={archive} />);
		await idle();
		expect(
			within(footer()).queryByRole("checkbox", { name: "All" }),
		).toBeNull();
		// no divider before the first action
		const bar = footer().querySelector("label")!.parentElement!;
		expect(bar.firstElementChild).toBe(footer().querySelector("label"));

		resizeTo(1200);
		const all = within(footer()).getByRole("checkbox", { name: "All" });
		expect(all.closest("label")).toHaveStyle({ opacity: "0" });
	});

	it("[ISSUE-3495-ITEM-22] on a phone the filtered count may break after the slash", async () => {
		stubViewport(320);
		render(
			<Grid
				loadData={() => ({ rowsTotal: 1234, rowsFiltered: 567, rows: ROWS })}
				classes={{ paginationText: "my-count" }}
			/>,
		);
		await idle();
		const count = footer().querySelector(".my-count")!;
		expect(count.textContent).toBe("#567/1,234");
		expect(count.innerHTML).toBe("#567/<wbr>1,234");
	});
});
