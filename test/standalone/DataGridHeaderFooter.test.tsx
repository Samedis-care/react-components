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
