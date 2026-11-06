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
import ccI18n from "../../src/i18n";
import DataGrid, {
	DataGridData,
	DataGridProps,
	DataGridRowData,
	IDataGridColumnDef,
	IDataGridColumnsState,
	IDataGridState,
	useDataGridColumnState,
	useDataGridColumnsWidthState,
	useDataGridState,
} from "../../src/standalone/DataGrid/DataGrid";
import type { IDataGridFilterBarProps } from "../../src/standalone/DataGrid/Header/FilterBar";
import type { IDataGridExporter } from "../../src/standalone/DataGrid/Header";

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
});

const header = () => document.querySelector<HTMLElement>(".test-header")!;

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
});

const openMenu = async (trigger: string, item?: string) => {
	fireEvent.click(screen.getByRole("button", { name: trigger }));
	if (item)
		fireEvent.click(await screen.findByRole("menuitem", { name: item }));
};

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
