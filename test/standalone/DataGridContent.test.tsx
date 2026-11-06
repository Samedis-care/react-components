import React, { useEffect } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
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
	IDataGridLoadDataParameters,
	IDataGridState,
	useDataGridColumnState,
	useDataGridColumnsWidthState,
	useDataGridState,
} from "../../src/standalone/DataGrid/DataGrid";
import type { IDataGridFilterBarProps } from "../../src/standalone/DataGrid/Header/FilterBar";

// The content of the grid (Content/: cells, column headers, rows). Unlike
// DataGridCore.test.tsx, MultiGrid is real here. AutoSizer measures nothing in
// jsdom (offsetWidth 0), so it is given a size: the real MultiGrid then renders
// the cells, react-window computes the visible range, and Content's first
// resize runs.
const SIZE = { width: 1000, height: 500 };
vi.mock("react-virtualized-auto-sizer", () => ({
	AutoSizer: (props: {
		onResize?: (s: { width: number; height: number }) => void;
		renderProp: (s: { width: number; height: number }) => React.ReactNode;
	}) => {
		const { onResize, renderProp } = props;
		useEffect(() => onResize?.(SIZE), [onResize]);
		return <>{renderProp(SIZE)}</>;
	},
}));

beforeAll(async () => {
	await ccI18n.init();
	await ccI18n.changeLanguage("en");
	// jsdom has neither; MUI's useMediaQuery and the filter bar need them
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
	// MultiGrid syncs the panes with scrollTo, which jsdom lacks. Writable, so
	// that a test can replace it on one pane.
	if (!("scrollTo" in Element.prototype))
		Object.defineProperty(Element.prototype, "scrollTo", {
			configurable: true,
			writable: true,
			value: () => {},
		});
});
afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.restoreAllMocks();
	probe = null;
});

const theme = createTheme();
const COLUMNS: IDataGridColumnDef[] = [
	{
		field: "name",
		headerName: "Name",
		type: "string",
		sortable: true,
		filterable: true,
	},
	{ field: "role", headerName: "Role", type: "string", sortable: true },
	{ field: "note", headerName: "Note", type: "string" },
];
const ROWS: DataGridRowData[] = [
	{ id: "1", name: "Alice", role: "admin", note: "n1" },
	{ id: "2", name: "Bob", role: "user", note: "n2" },
	{ id: "3", name: "Carol", role: "user", note: "n3" },
];
const ok = (): DataGridData => ({ rowsTotal: ROWS.length, rows: ROWS });
const loadSpy = (impl: (p: IDataGridLoadDataParameters) => DataGridData = ok) =>
	vi.fn<(p: IDataGridLoadDataParameters) => DataGridData>(impl);

type Probe = {
	state: IDataGridState;
	setState: React.Dispatch<React.SetStateAction<IDataGridState>>;
	columnState: IDataGridColumnsState;
	widths: Record<string, number>;
};
let probe: Probe | null = null;
/**
 * A filter bar renders inside all of the grid's providers, so it can read the
 * grid's state through the exported hooks, as app filter bars do
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProbeBar = React.memo(function ProbeBar(_p: IDataGridFilterBarProps) {
	const [state, setState] = useDataGridState();
	const [columnState] = useDataGridColumnState();
	const [widths] = useDataGridColumnsWidthState();
	probe = { state, setState, columnState, widths };
	return null;
});

const Grid = (props: Partial<DataGridProps>) => (
	<ThemeProvider theme={theme}>
		<DataGrid
			columns={COLUMNS}
			loadData={ok}
			filterBar={ProbeBar}
			classes={{ columnHeaderResizer: "probe-resizer", cell: "probe-cell" }}
			{...props}
		/>
	</ThemeProvider>
);
/** no load running or queued */
const idle = () =>
	waitFor(() => expect(probe?.state.refreshData).toBe(0), { timeout: 3000 });
/** the first render's width distribution has run */
const sized = () =>
	waitFor(() => expect(probe?.state.initialResize).toBe(true));
/** past the 500ms debounce of the reload after a query change */
const passDebounce = () => act(() => void vi.advanceTimersByTime(700));

// DOM helpers. Data cells are found by class; the header content carries
// `column-header-<field>`, the data cells `column-<field>`. `[class~=…]`
// also works for a field with a dot.
const headerWrapper = (c: HTMLElement, field: string) =>
	c.querySelector<HTMLElement>(`[class~="column-header-${field}"]`)!;
const resizer = (c: HTMLElement, field: string) =>
	headerWrapper(c, field).querySelector<HTMLElement>(".probe-resizer")!;
/**
 * The pointer's x position: a press on a resize handle sets it, every move
 * advances it. The moves carry both clientX and movementX, so the tests hold
 * for a resize computed from either.
 */
let pointerX = 0;
/** a mouse down on a column's resize handle */
const pressResizer = (
	c: HTMLElement,
	field: string,
	init: MouseEventInit = {},
) => {
	pointerX = 500;
	fireEvent.mouseDown(resizer(c, field), { clientX: pointerX, ...init });
};
/** a mouse move on the document, where the resize listens */
const mouseMove = (movementX: number, buttons = 1) => {
	pointerX += movementX;
	const evt = new MouseEvent("mousemove", {
		bubbles: true,
		cancelable: true,
		buttons,
		clientX: pointerX,
	});
	// jsdom's MouseEventInit has no movementX
	Object.defineProperty(evt, "movementX", { value: movementX });
	act(() => void document.dispatchEvent(evt));
};
const mouseUp = () =>
	act(() => void document.dispatchEvent(new MouseEvent("mouseup")));

describe("Content / ColumnHeader: widths", () => {
	it("[ISSUE-3493-ITEM-2] a resize that ends over the column's own header does not sort it", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		const loadData = loadSpy();
		const { container } = render(<Grid loadData={loadData} />);
		await idle();
		await sized();
		loadData.mockClear();
		const wrapper = headerWrapper(container, "name");
		// shrink past the minimum: the edge stops at 96px, the pointer moves on
		// and is released over the column's label
		pressResizer(container, "name");
		mouseMove(-1000);
		fireEvent.mouseUp(within(wrapper).getByText("Name"));
		// the browser then fires click on the nearest common ancestor of the
		// press and the release target: the header content wrapper (measured
		// with real input in Chromium). A fix that captures the pointer on the
		// handle sends that click to the handle instead: update this line with it.
		fireEvent.click(wrapper);
		passDebounce();
		await idle();
		expect(probe!.widths.name).toBe(96);
		expect(probe!.columnState.name.sort).toBe(0);
		expect(loadData).not.toHaveBeenCalled();
	});

	it("[ISSUE-3493-ITEM-2] after a resize, a click on the header sorts again", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		const loadData = loadSpy();
		const { container } = render(<Grid loadData={loadData} />);
		await idle();
		await sized();
		const wrapper = headerWrapper(container, "name");
		const label = within(wrapper).getByText("Name");
		// a resize released outside the header: no click reaches the header
		pressResizer(container, "name");
		mouseMove(-50);
		mouseUp();
		// a plain click on the label: press, release, click
		loadData.mockClear();
		fireEvent.mouseDown(label);
		fireEvent.mouseUp(label);
		fireEvent.click(label);
		passDebounce();
		await idle();
		expect(probe!.columnState.name.sort).toBe(1);
		expect(loadData).toHaveBeenLastCalledWith(
			expect.objectContaining({ sort: [{ field: "name", direction: 1 }] }),
		);
	});

	it("[ISSUE-3493-ITEM-2] the edge follows the pointer: past a limit and back, the width is the start width plus the pointer's distance", async () => {
		const { container } = render(<Grid />);
		await sized();
		const start = probe!.widths.role;
		expect(start).toBeGreaterThan(200);
		pressResizer(container, "role");
		mouseMove(-1000);
		// role is not filterable: 64px at least
		expect(probe!.widths.role).toBe(64);
		mouseMove(1000);
		expect(probe!.widths.role).toBe(start);
		mouseMove(30);
		expect(probe!.widths.role).toBe(start + 30);
		mouseUp();
		// a move after the release changes nothing
		mouseMove(30);
		expect(probe!.widths.role).toBe(start + 30);
	});

	it("[ISSUE-3493-ITEM-2] the width follows the pointer in CSS pixels, not the screen pixels of movementX", async () => {
		const { container } = render(<Grid />);
		await sized();
		const start = probe!.widths.role;
		pressResizer(container, "role");
		// a page shown at 80%: 100 CSS px of pointer travel are 80 screen px
		const evt = new MouseEvent("mousemove", {
			bubbles: true,
			cancelable: true,
			buttons: 1,
			clientX: 600,
		});
		Object.defineProperty(evt, "movementX", { value: 80 });
		act(() => void document.dispatchEvent(evt));
		mouseUp();
		expect(probe!.widths.role).toBe(start + 100);
	});
});
