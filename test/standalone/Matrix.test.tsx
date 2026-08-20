import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import MatrixGrid from "../../src/standalone/Matrix/MatrixGrid";
import MatrixCellTile from "../../src/standalone/Matrix/MatrixCellTile";
import buildDateColumns from "../../src/standalone/Matrix/buildDateColumns";
import { matrixClasses } from "../../src/standalone/Matrix/matrixClasses";
import {
	MatrixColumn,
	MatrixRow,
	MatrixTileItem,
} from "../../src/standalone/Matrix/types";

afterEach(() => {
	cleanup();
});

const theme = createTheme();
const wrap = (ui: React.ReactNode) =>
	render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("buildDateColumns", () => {
	it("builds one inclusive column per day", () => {
		const columns = buildDateColumns({
			from: "2026-03-02",
			to: "2026-03-08",
			locale: "en-US",
			today: null,
		});
		expect(columns).toHaveLength(7);
		expect(columns[0].key).toBe("2026-03-02");
		expect(columns[6].key).toBe("2026-03-08");
		expect(columns[0].label).toBe(2);
	});

	it("mutes the weekend, marks today, and lets accent win", () => {
		const columns = buildDateColumns({
			from: "2026-03-02", // Monday
			to: "2026-03-08", // Sunday
			locale: "en-US",
			today: "2026-03-04",
			accent: "2026-03-07", // Saturday: accent over muted
		});
		const variantOf = (key: string) =>
			columns.find((column) => column.key === key)?.variant;
		expect(variantOf("2026-03-02")).toBe("normal");
		expect(variantOf("2026-03-04")).toBe("current");
		expect(variantOf("2026-03-07")).toBe("accent");
		expect(variantOf("2026-03-08")).toBe("muted");
	});

	it("normalizes today and accent, so a timestamp marks its day", () => {
		const columns = buildDateColumns({
			from: "2026-03-02",
			to: "2026-03-08",
			today: "2026-03-04T23:30:00",
			accent: ["2026-03-06T00:00:00"],
		});
		const variantOf = (key: string) =>
			columns.find((column) => column.key === key)?.variant;
		expect(variantOf("2026-03-04")).toBe("current");
		expect(variantOf("2026-03-06")).toBe("accent");
	});

	it("localizes the weekday sub label without moment locales", () => {
		const [monday] = buildDateColumns({
			from: "2026-03-02",
			to: "2026-03-02",
			locale: "de-DE",
			today: null,
		});
		expect(monday.subLabel as string).toMatch(/^Mo/);
	});

	it("says so when the range is reversed or unparseable", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
		expect(
			buildDateColumns({ from: "2026-03-08", to: "2026-03-02", today: null }),
		).toEqual([]);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining("no columns"));
		warn.mockRestore();
	});

	it("caps the range at maxColumns and says so", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
		const columns = buildDateColumns({
			from: "2026-01-01",
			to: "2027-01-01",
			today: null,
			maxColumns: 10,
		});
		expect(columns).toHaveLength(10);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining("truncated"));
		warn.mockRestore();
	});
});

// ---- MatrixGrid -------------------------------------------------------------

interface TestCell {
	text: string;
}

const COLUMNS: MatrixColumn[] = [
	{ key: "c1", label: "1" },
	{ key: "c2", label: "2" },
	{ key: "c3", label: "3" },
	{ key: "c4", label: "4" },
];

const ROWS: MatrixRow<TestCell>[] = [
	{ key: "r1", label: "Row one", cells: { c2: { text: "busy" } } },
	{ key: "r2", label: "Row two", cells: {}, selectable: false },
];

const renderGrid = (
	props: Partial<React.ComponentProps<typeof MatrixGrid<TestCell>>> = {},
) =>
	wrap(
		<MatrixGrid<TestCell>
			columns={COLUMNS}
			rows={ROWS}
			corner={"corner"}
			renderRowHeader={(row) => <span>{`header-${row.key}`}</span>}
			renderCell={(cell, context) => (
				<span data-testid={`cell-${context.row.key}-${context.column.key}`}>
					{cell?.text ?? ""}
				</span>
			)}
			{...props}
		/>,
	);

const cellOf = (rowKey: string, columnKey: string) =>
	screen
		.getByTestId(`cell-${rowKey}-${columnKey}`)
		.closest("[class*=CcMatrixGrid-cell]") as HTMLElement;

describe("MatrixGrid", () => {
	it("renders a corner, every column header and every row header", () => {
		renderGrid();
		expect(screen.getByText("corner")).toBeInTheDocument();
		expect(screen.getByText("header-r1")).toBeInTheDocument();
		expect(screen.getByText("header-r2")).toBeInTheDocument();
		// 4 columns x 2 rows
		expect(document.querySelectorAll("[data-testid^=cell-]")).toHaveLength(8);
		expect(cellOf("r1", "c2")).toHaveTextContent("busy");
	});

	it("reports a single cell range on a plain click", () => {
		const onSelectRange = vi.fn();
		renderGrid({ selectable: true, onSelectRange });
		fireEvent.mouseDown(cellOf("r1", "c1"));
		fireEvent.mouseUp(window);
		expect(onSelectRange).toHaveBeenCalledWith({
			rowKey: "r1",
			fromColumnKey: "c1",
			toColumnKey: "c1",
			columnKeys: ["c1"],
		});
	});

	it("normalizes a range swept from right to left", () => {
		const onSelectRange = vi.fn();
		renderGrid({ selectable: true, onSelectRange });
		fireEvent.mouseDown(cellOf("r1", "c4"));
		fireEvent.mouseOver(cellOf("r1", "c3"));
		fireEvent.mouseUp(window);
		expect(onSelectRange).toHaveBeenCalledWith({
			rowKey: "r1",
			fromColumnKey: "c3",
			toColumnKey: "c4",
			columnKeys: ["c3", "c4"],
		});
	});

	it("ignores anything but the left button", () => {
		const onSelectRange = vi.fn();
		renderGrid({ selectable: true, onSelectRange });
		// right click: no range, and the native context menu stays alive
		const cell = cellOf("r1", "c1");
		const down = fireEvent.mouseDown(cell, { button: 2 });
		fireEvent.mouseUp(window, { button: 2 });
		expect(down).toBe(true); // not defaultPrevented
		expect(onSelectRange).not.toHaveBeenCalled();
		// middle click
		fireEvent.mouseDown(cell, { button: 1 });
		fireEvent.mouseUp(window, { button: 1 });
		expect(onSelectRange).not.toHaveBeenCalled();
		// and a left press released by the right button is not a range either
		fireEvent.mouseDown(cell, { button: 0 });
		fireEvent.mouseUp(window, { button: 2 });
		expect(onSelectRange).not.toHaveBeenCalled();
	});

	it("drops the press when it is released with another button", () => {
		const onSelectRange = vi.fn();
		renderGrid({
			selectable: true,
			onSelectRange,
			rows: [{ key: "r1", cells: {} }],
		});
		fireEvent.mouseDown(cellOf("r1", "c1"));
		fireEvent.mouseOver(cellOf("r1", "c2"));
		fireEvent.mouseUp(window, { button: 2 });
		expect(onSelectRange).not.toHaveBeenCalled();
		expect(cellOf("r1", "c1").className).not.toContain(
			matrixClasses.cellSelected,
		);
		// and the next left release anywhere must not commit the dead range
		fireEvent.mouseUp(window);
		expect(onSelectRange).not.toHaveBeenCalled();
	});

	it("drops the press when the window loses focus or the menu opens", () => {
		const onSelectRange = vi.fn();
		renderGrid({
			selectable: true,
			onSelectRange,
			rows: [{ key: "r1", cells: {} }],
		});
		fireEvent.mouseDown(cellOf("r1", "c1"));
		fireEvent.blur(window);
		fireEvent.mouseUp(window);
		expect(onSelectRange).not.toHaveBeenCalled();
		fireEvent.mouseDown(cellOf("r1", "c1"));
		fireEvent.contextMenu(window);
		fireEvent.mouseUp(window);
		expect(onSelectRange).not.toHaveBeenCalled();
	});

	it("stops a sweep at the first cell isCellSelectable rejects", () => {
		const onSelectRange = vi.fn();
		// c2 holds a cell -> not selectable under the default predicate
		renderGrid({ selectable: true, onSelectRange });
		fireEvent.mouseDown(cellOf("r1", "c1"));
		fireEvent.mouseOver(cellOf("r1", "c3"));
		// the swept-over c2 is neither reported nor painted
		expect(cellOf("r1", "c2").className).not.toContain(
			matrixClasses.cellSelected,
		);
		expect(cellOf("r1", "c3").className).not.toContain(
			matrixClasses.cellSelected,
		);
		expect(cellOf("r1", "c1").className).toContain(matrixClasses.cellSelected);
		fireEvent.mouseUp(window);
		expect(onSelectRange).toHaveBeenCalledWith({
			rowKey: "r1",
			fromColumnKey: "c1",
			toColumnKey: "c1",
			columnKeys: ["c1"],
		});
	});

	it("clamps a fast drag that skipped over the rejected cell", () => {
		const onSelectRange = vi.fn();
		renderGrid({ selectable: true, onSelectRange });
		// c2 is occupied: pressing c1 and landing on c4 without ever entering
		// c2 or c3 still stops the range in front of c2
		fireEvent.mouseDown(cellOf("r1", "c1"));
		fireEvent.mouseOver(cellOf("r1", "c4"));
		fireEvent.mouseUp(window);
		expect(onSelectRange).toHaveBeenCalledWith({
			rowKey: "r1",
			fromColumnKey: "c1",
			toColumnKey: "c1",
			columnKeys: ["c1"],
		});
	});

	it("extends a range across cells that are free", () => {
		const onSelectRange = vi.fn();
		renderGrid({
			selectable: true,
			onSelectRange,
			rows: [{ key: "r1", cells: {} }],
		});
		fireEvent.mouseDown(cellOf("r1", "c1"));
		fireEvent.mouseOver(cellOf("r1", "c4")); // skips c2 and c3
		fireEvent.mouseUp(window);
		expect(onSelectRange).toHaveBeenCalledWith(
			expect.objectContaining({ columnKeys: ["c1", "c2", "c3", "c4"] }),
		);
	});

	it("shrinks the range when the pointer comes back to the press cell", () => {
		const onSelectRange = vi.fn();
		renderGrid({
			selectable: true,
			onSelectRange,
			rows: [{ key: "r1", cells: {} }],
		});
		fireEvent.mouseDown(cellOf("r1", "c1"));
		fireEvent.mouseOver(cellOf("r1", "c3"));
		fireEvent.mouseOver(cellOf("r1", "c1")); // all the way back
		expect(cellOf("r1", "c2").className).not.toContain(
			matrixClasses.cellSelected,
		);
		expect(cellOf("r1", "c3").className).not.toContain(
			matrixClasses.cellSelected,
		);
		fireEvent.mouseUp(window);
		expect(onSelectRange).toHaveBeenCalledWith(
			expect.objectContaining({ columnKeys: ["c1"] }),
		);
	});

	it("paints exactly the cells of the range", () => {
		renderGrid({ selectable: true, onSelectRange: vi.fn() });
		fireEvent.mouseDown(cellOf("r1", "c3"));
		fireEvent.mouseOver(cellOf("r1", "c4"));
		expect(cellOf("r1", "c3").className).toContain(matrixClasses.cellSelected);
		expect(cellOf("r1", "c4").className).toContain(matrixClasses.cellSelected);
		expect(cellOf("r1", "c1").className).not.toContain(
			matrixClasses.cellSelected,
		);
	});

	it("re-renders only the row that changed", () => {
		const renderCell = vi.fn(
			(cell: TestCell | undefined, context: { row: { key: string } }) => (
				<span>{context.row.key}</span>
			),
		);
		const rowOne: MatrixRow<TestCell> = { key: "r1", cells: {} };
		const grid = (rows: MatrixRow<TestCell>[]) => (
			<ThemeProvider theme={theme}>
				<MatrixGrid<TestCell>
					columns={COLUMNS}
					rows={rows}
					renderRowHeader={(row) => <span>{row.key}</span>}
					renderCell={renderCell}
				/>
			</ThemeProvider>
		);
		const { rerender } = render(grid([rowOne, { key: "r2", cells: {} }]));
		expect(renderCell).toHaveBeenCalledTimes(8);
		renderCell.mockClear();
		// r1 keeps its identity, r2 is a new object
		rerender(grid([rowOne, { key: "r2", cells: {} }]));
		const rowsRendered = renderCell.mock.calls.map((call) => call[1].row.key);
		expect(rowsRendered).toEqual(["r2", "r2", "r2", "r2"]);
	});

	it("leaves the cell contents alone while a range is swept", () => {
		// The point of the interaction store: a sweep repaints a handful of
		// cells and must not send renderCell over the whole grid again.
		const renderCell = vi.fn(() => <span>{"x"}</span>);
		wrap(
			<MatrixGrid<TestCell>
				columns={COLUMNS}
				rows={[{ key: "r1", cells: {} }]}
				selectable={true}
				onSelectRange={vi.fn()}
				renderRowHeader={(row) => <span>{row.key}</span>}
				renderCell={renderCell}
			/>,
		);
		const cells = Array.from(
			document.querySelectorAll<HTMLElement>("[class*=CcMatrixGrid-cell]"),
		);
		expect(renderCell).toHaveBeenCalledTimes(4);
		fireEvent.mouseDown(cells[0]);
		fireEvent.mouseOver(cells[1]);
		fireEvent.mouseOver(cells[2]);
		fireEvent.mouseOver(cells[3]);
		fireEvent.mouseUp(window);
		expect(renderCell).toHaveBeenCalledTimes(4);
		expect(cells[3].className).not.toContain(matrixClasses.cellSelected);
	});

	it("re-checks selectability at release, not only while moving", () => {
		const onSelectRange = vi.fn();
		const free: MatrixRow<TestCell>[] = [{ key: "r1", cells: {} }];
		const { rerender } = wrap(
			<MatrixGrid<TestCell>
				columns={COLUMNS}
				rows={free}
				selectable={true}
				onSelectRange={onSelectRange}
				renderRowHeader={(row) => <span>{row.key}</span>}
				renderCell={(cell, context) => (
					<span data-testid={`cell-${context.row.key}-${context.column.key}`} />
				)}
			/>,
		);
		fireEvent.mouseDown(cellOf("r1", "c1"));
		fireEvent.mouseOver(cellOf("r1", "c4"));
		// a refetch fills c2 while the button is still down; the pointer does
		// not move again, so only the release can catch it
		rerender(
			<ThemeProvider theme={theme}>
				<MatrixGrid<TestCell>
					columns={COLUMNS}
					rows={[{ key: "r1", cells: { c2: { text: "busy" } } }]}
					selectable={true}
					onSelectRange={onSelectRange}
					renderRowHeader={(row) => <span>{row.key}</span>}
					renderCell={(cell, context) => (
						<span
							data-testid={`cell-${context.row.key}-${context.column.key}`}
						/>
					)}
				/>
			</ThemeProvider>,
		);
		fireEvent.mouseUp(window);
		expect(onSelectRange).toHaveBeenCalledWith(
			expect.objectContaining({ columnKeys: ["c1"] }),
		);
	});

	it("aborts the range on Escape", () => {
		const onSelectRange = vi.fn();
		renderGrid({ selectable: true, onSelectRange });
		fireEvent.mouseDown(cellOf("r1", "c1"));
		fireEvent.keyDown(window, { key: "Escape" });
		expect(cellOf("r1", "c1").className).not.toContain(
			matrixClasses.cellSelected,
		);
		fireEvent.mouseUp(window);
		expect(onSelectRange).not.toHaveBeenCalled();
	});

	it("does not select occupied cells, or rows opted out", () => {
		const onSelectRange = vi.fn();
		renderGrid({ selectable: true, onSelectRange });
		fireEvent.mouseDown(cellOf("r1", "c2"));
		fireEvent.mouseUp(window);
		fireEvent.mouseDown(cellOf("r2", "c1"));
		fireEvent.mouseUp(window);
		expect(onSelectRange).not.toHaveBeenCalled();
	});

	it("selects an occupied cell when isCellSelectable says so", () => {
		const onSelectRange = vi.fn();
		renderGrid({
			selectable: true,
			onSelectRange,
			isCellSelectable: () => true,
		});
		fireEvent.mouseDown(cellOf("r1", "c2"));
		fireEvent.mouseUp(window);
		expect(onSelectRange).toHaveBeenCalledWith(
			expect.objectContaining({ rowKey: "r1", fromColumnKey: "c2" }),
		);
	});

	it("shows the add hint on hover, half height on an occupied cell", () => {
		renderGrid({
			selectable: true,
			addLabel: "Add",
			isCellSelectable: () => true,
		});
		fireEvent.mouseOver(cellOf("r1", "c1"));
		const hint = screen.getByText("Add");
		expect(hint.className).not.toContain(matrixClasses.addHintHalf);
		fireEvent.mouseOut(cellOf("r1", "c1"));
		fireEvent.mouseOver(cellOf("r1", "c2")); // holds an entry
		expect(screen.getByText("Add").className).toContain(
			matrixClasses.addHintHalf,
		);
	});

	it("keeps the add hint after a click finished a range", () => {
		renderGrid({ selectable: true, addLabel: "Add", onSelectRange: vi.fn() });
		fireEvent.mouseOver(cellOf("r1", "c1"));
		fireEvent.mouseDown(cellOf("r1", "c1"));
		fireEvent.mouseUp(window);
		// the pointer never left the cell, so the hint is still there
		expect(screen.getByText("Add")).toBeInTheDocument();
	});

	it("does not swallow the default on a drag handle inside a cell", () => {
		renderGrid({
			selectable: true,
			isCellSelectable: () => true,
			renderCellWrapper: (node) => <div draggable={true}>{node}</div>,
		});
		const handle = cellOf("r1", "c1").querySelector(
			"[draggable=true]",
		) as HTMLElement;
		const notPrevented = fireEvent.mouseDown(handle);
		expect(notPrevented).toBe(true);
	});

	it("wraps cell contents with renderCellWrapper", () => {
		renderGrid({
			renderCellWrapper: (node, context) => (
				<div data-testid={`wrapper-${context.row.key}-${context.column.key}`}>
					{node}
				</div>
			),
		});
		expect(screen.getByTestId("wrapper-r1-c1")).toBeInTheDocument();
	});

	describe("extra rows", () => {
		const extraRows = [
			{
				key: "demand",
				header: <span>{"demand"}</span>,
				label: "Open demand",
				getCellLabel: (columnKey: string) => `Open demand on ${columnKey}`,
				badges: { c2: 9, c3: 0 },
				onCellClick: vi.fn(),
			},
		];

		it("renders below the data rows by default", () => {
			renderGrid({ extraRows });
			const cells = Array.from(
				document.querySelectorAll<HTMLElement>(
					`[class*=CcMatrixGrid-rowHeader], [class*=CcMatrixGrid-extraRowHeader]`,
				),
			);
			const kinds = cells.map((cell) =>
				cell.className.includes("extraRowHeader") ? "extra" : "data",
			);
			expect(kinds).toEqual(["data", "data", "extra"]);
		});

		it("renders above the data rows when asked to", () => {
			renderGrid({ extraRows, extraRowsPosition: "top" });
			const cells = Array.from(
				document.querySelectorAll<HTMLElement>(
					`[class*=CcMatrixGrid-rowHeader], [class*=CcMatrixGrid-extraRowHeader]`,
				),
			);
			const kinds = cells.map((cell) =>
				cell.className.includes("extraRowHeader") ? "extra" : "data",
			);
			expect(kinds).toEqual(["extra", "data", "data"]);
		});

		it("renders a badge of zero, and reports clicks", () => {
			renderGrid({ extraRows });
			expect(screen.getByText("9")).toBeInTheDocument();
			// zero is a value, not a blank
			expect(screen.getByText("0")).toBeInTheDocument();
			fireEvent.click(screen.getByText("9"));
			expect(extraRows[0].onCellClick).toHaveBeenCalledWith("c2");
		});

		it("labels its cells and answers the keyboard", () => {
			renderGrid({ extraRows });
			const cell = screen.getByLabelText("Open demand on c1");
			expect(cell).toHaveAttribute("role", "button");
			fireEvent.keyDown(cell, { key: "Enter" });
			expect(extraRows[0].onCellClick).toHaveBeenCalledWith("c1");
		});
	});

	describe("touch mode", () => {
		beforeEach(() => {
			window.matchMedia = vi.fn().mockImplementation((query: string) => ({
				matches: query.includes("pointer: coarse"),
				media: query,
				addEventListener: () => undefined,
				removeEventListener: () => undefined,
				addListener: () => undefined,
				removeListener: () => undefined,
				onchange: null,
				dispatchEvent: () => false,
			}));
		});
		afterEach(() => {
			// @ts-expect-error jsdom has no matchMedia to restore to
			delete window.matchMedia;
		});

		it("turns the row header into one labelled, keyboard-reachable button", () => {
			const onRowHeaderActions = vi.fn();
			renderGrid({ onRowHeaderActions });
			const header = screen.getByLabelText("Row one");
			expect(header).toHaveAttribute("role", "button");
			expect(header).toHaveAttribute("tabindex", "0");
			fireEvent.keyDown(header, { key: " " });
			expect(onRowHeaderActions).toHaveBeenCalledWith("r1");
			fireEvent.click(header);
			expect(onRowHeaderActions).toHaveBeenCalledTimes(2);
		});

		it("shows the aggregate row's add hint outright", () => {
			renderGrid({
				extraRows: [
					{
						key: "demand",
						header: <span>{"demand"}</span>,
						label: "Open demand",
						onCellClick: vi.fn(),
					},
				],
			});
			// every column of the row carries the row's name
			const cell = screen.getAllByLabelText("Open demand")[0];
			expect(cell.className).toContain(matrixClasses.touch);
		});

		it("shows no add hint, because there is no hover", () => {
			renderGrid({ selectable: true, addLabel: "Add" });
			fireEvent.mouseOver(cellOf("r1", "c1"));
			expect(screen.queryByText("Add")).not.toBeInTheDocument();
		});
	});

	describe("scrolling to a column", () => {
		let writes: number[] = [];
		beforeEach(() => {
			writes = [];
			// Stand in for layout: every cell sits at its position in the grid,
			// so moving a column really does move its offset.
			Object.defineProperty(HTMLElement.prototype, "offsetLeft", {
				configurable: true,
				get(this: HTMLElement) {
					const siblings = Array.from(this.parentElement?.children ?? []);
					return siblings.indexOf(this) * 200;
				},
			});
			Object.defineProperty(HTMLElement.prototype, "scrollLeft", {
				configurable: true,
				get() {
					return 0;
				},
				set(value: number) {
					writes.push(value);
				},
			});
		});
		afterEach(() => {
			// @ts-expect-error removing the stubs restores jsdom's own behavior
			delete HTMLElement.prototype.offsetLeft;
			// @ts-expect-error see above
			delete HTMLElement.prototype.scrollLeft;
		});

		const current = (key: string) => (column: MatrixColumn) =>
			column.key === key ? { ...column, variant: "current" as const } : column;
		const grid = (columns: MatrixColumn[]) => (
			<ThemeProvider theme={theme}>
				<MatrixGrid<TestCell>
					columns={columns}
					rows={ROWS}
					columnWidth={50}
					rowHeaderWidth={100}
					renderRowHeader={(row) => <span>{row.key}</span>}
					renderCell={() => null}
				/>
			</ThemeProvider>
		);

		it("scrolls the current column just past the row header", () => {
			// corner is child 0, so c3 is child 3 -> 600 - 100 - 50
			render(grid(COLUMNS.map(current("c3"))));
			expect(writes).toEqual([450]);
		});

		it("scrolls again when the window rolls on and the target moves", () => {
			const { rerender } = render(grid(COLUMNS.map(current("c3"))));
			expect(writes).toEqual([450]);
			// the range advanced by one day: same column count, c3 moved left
			rerender(
				grid(
					[
						{ key: "c2", label: "2" },
						{ key: "c3", label: "3" },
						{ key: "c4", label: "4" },
						{ key: "c5", label: "5" },
					].map(current("c3")),
				),
			);
			expect(writes).toEqual([450, 250]);
		});

		it("leaves the scroll alone when the columns are rebuilt in place", () => {
			// a fresh array on every render, as a consumer that builds its
			// columns inline would produce
			const { rerender } = render(grid(COLUMNS.map(current("c3"))));
			rerender(grid(COLUMNS.map(current("c3"))));
			rerender(grid(COLUMNS.map(current("c3"))));
			// the target never moved, so the user's scroll position stands
			expect(writes).toEqual([450]);
		});
	});
});

// ---- MatrixCellTile ---------------------------------------------------------

const item = (
	key: string,
	overrides: Partial<MatrixTileItem> = {},
): MatrixTileItem => ({
	key,
	label: key.toUpperCase(),
	backgroundColor: "#123456",
	...overrides,
});

describe("MatrixCellTile", () => {
	it("renders the placeholder when there are no items", () => {
		wrap(<MatrixCellTile items={[]} placeholder={<span>{"absent"}</span>} />);
		expect(screen.getByText("absent")).toBeInTheDocument();
	});

	it("renders both items of a split pair, and the corners of each", () => {
		wrap(
			<MatrixCellTile
				items={[
					item("a", { corners: { bottomLeft: <span>{"glyph"}</span> } }),
					item("b", { corners: { topRight: <span>{"flag"}</span> } }),
				]}
			/>,
		);
		expect(screen.getByText("A")).toBeInTheDocument();
		expect(screen.getByText("B")).toBeInTheDocument();
		expect(screen.getByText("glyph")).toBeInTheDocument();
		expect(screen.getByText("flag")).toBeInTheDocument();
	});

	it("renders at most two items", () => {
		wrap(<MatrixCellTile items={[item("a"), item("b"), item("c")]} />);
		expect(screen.queryByText("C")).not.toBeInTheDocument();
	});

	it("renders a diagonal pair as one click target", () => {
		const onItemClick = vi.fn();
		wrap(
			<MatrixCellTile
				items={[item("a"), item("b")]}
				pairLayout={"diagonal"}
				onItemClick={onItemClick}
			/>,
		);
		fireEvent.click(screen.getByText("B"));
		// the pair reports its first item, whichever half was clicked
		expect(onItemClick).toHaveBeenCalledWith(
			expect.objectContaining({ key: "a" }),
		);
	});

	it("drops all but the first item's bottom left corner in a diagonal pair", () => {
		wrap(
			<MatrixCellTile
				items={[
					item("a", {
						corners: {
							bottomLeft: <span>{"kept"}</span>,
							bottomRight: <span>{"dropped"}</span>,
						},
					}),
					item("b", { corners: { topRight: <span>{"also-dropped"}</span> } }),
				]}
				pairLayout={"diagonal"}
			/>,
		);
		expect(screen.getByText("kept")).toBeInTheDocument();
		expect(screen.queryByText("dropped")).not.toBeInTheDocument();
		expect(screen.queryByText("also-dropped")).not.toBeInTheDocument();
	});

	it("reports the clicked item of a split pair", () => {
		const onItemClick = vi.fn();
		wrap(
			<MatrixCellTile
				items={[item("a"), item("b")]}
				onItemClick={onItemClick}
			/>,
		);
		fireEvent.click(screen.getByText("B"));
		expect(onItemClick).toHaveBeenCalledWith(
			expect.objectContaining({ key: "b" }),
		);
	});

	it("passes every rendered item through renderItem", () => {
		wrap(
			<MatrixCellTile
				items={[item("a"), item("b")]}
				renderItem={(tileItem, node) => (
					<div data-testid={`handle-${tileItem.key}`}>{node}</div>
				)}
			/>,
		);
		expect(screen.getByTestId("handle-a")).toBeInTheDocument();
		expect(screen.getByTestId("handle-b")).toBeInTheDocument();
	});

	it("mounts a tooltip only for an item that has one", async () => {
		wrap(
			<MatrixCellTile items={[item("a", { tooltip: "hello" }), item("b")]} />,
		);
		fireEvent.mouseOver(screen.getByText("A"));
		await waitFor(() =>
			expect(screen.getByRole("tooltip")).toHaveTextContent("hello"),
		);
		fireEvent.mouseOut(screen.getByText("A"));
		await waitFor(() =>
			expect(screen.queryByRole("tooltip")).not.toBeInTheDocument(),
		);
		fireEvent.mouseOver(screen.getByText("B"));
		await new Promise((resolve) => setTimeout(resolve, 600)); // past enterDelay
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});

	it("dims a diagonal half in any color format", () => {
		const { container } = wrap(
			<MatrixCellTile
				items={[
					item("a", { dimmed: true }),
					item("b", { dimmed: true, backgroundColor: "rgb(1, 2, 3)" }),
				]}
				pairLayout={"diagonal"}
			/>,
		);
		const pair = container.querySelector("[class*=diagonal]") as HTMLElement;
		expect(pair.style.getPropertyValue("--cc-matrix-tile-bg-a")).toBe(
			"rgba(18, 52, 86, 0.6)",
		);
		expect(pair.style.getPropertyValue("--cc-matrix-tile-bg-b")).toBe(
			"rgba(1, 2, 3, 0.6)",
		);
	});

	it("dims a CSS keyword too, and leaves the unresolvable alone", () => {
		const { container } = wrap(
			<MatrixCellTile
				items={[
					item("a", { dimmed: true, backgroundColor: "rebeccapurple" }),
					item("b", { dimmed: true, backgroundColor: "var(--brand)" }),
				]}
				pairLayout={"diagonal"}
			/>,
		);
		const pair = container.querySelector("[class*=diagonal]") as HTMLElement;
		// #663399 at 60%
		expect(pair.style.getPropertyValue("--cc-matrix-tile-bg-a")).toBe(
			"rgba(102, 51, 153, 0.6)",
		);
		// nothing can resolve this one, so it stays flat instead of throwing
		expect(pair.style.getPropertyValue("--cc-matrix-tile-bg-b")).toBe(
			"var(--brand)",
		);
	});

	it("renders the highlight ring with a palette color of any format", () => {
		const rgbTheme = createTheme({
			palette: { warning: { main: "rgb(237, 108, 2)" } },
		});
		const { container } = render(
			<ThemeProvider theme={rgbTheme}>
				<MatrixCellTile items={[item("a", { highlighted: true })]} />
			</ThemeProvider>,
		);
		const ring = container.querySelector("[class*=highlight]") as HTMLElement;
		const shadow = getComputedStyle(ring).boxShadow;
		expect(shadow).not.toBe("");
		expect(shadow).toContain("rgb(237, 108, 2)");
		expect(shadow).toContain("rgba(237, 108, 2, 0.5)");
	});

	it("renders a placeholder of zero", () => {
		wrap(<MatrixCellTile items={[]} placeholder={0} />);
		expect(screen.getByText("0")).toBeInTheDocument();
	});
});
