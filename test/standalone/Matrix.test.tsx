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
	MatrixCellContext,
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

	it("is reachable by keyboard, and a named region when labelled", () => {
		const { container } = wrap(
			<MatrixGrid<TestCell>
				columns={COLUMNS}
				rows={ROWS}
				label={"Ward A roster"}
				renderRowHeader={(row) => <span>{row.key}</span>}
				renderCell={() => null}
			/>,
		);
		const scroller = container.firstElementChild as HTMLElement;
		expect(scroller).toHaveAttribute("tabindex", "0");
		expect(scroller).toHaveAttribute("role", "region");
		expect(scroller).toHaveAttribute("aria-label", "Ward A roster");
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

	it("drops the range when the press cell itself filled up", () => {
		const onSelectRange = vi.fn();
		const cellRenderer = (
			cell: TestCell | undefined,
			context: MatrixCellContext<TestCell>,
		) => <span data-testid={`cell-${context.row.key}-${context.column.key}`} />;
		const grid = (rows: MatrixRow<TestCell>[]) => (
			<ThemeProvider theme={theme}>
				<MatrixGrid<TestCell>
					columns={COLUMNS}
					rows={rows}
					selectable={true}
					onSelectRange={onSelectRange}
					renderRowHeader={(row) => <span>{row.key}</span>}
					renderCell={cellRenderer}
				/>
			</ThemeProvider>
		);
		const { rerender } = render(grid([{ key: "r1", cells: {} }]));
		fireEvent.mouseDown(cellOf("r1", "c1"));
		// a refetch fills the very cell the press started on
		rerender(grid([{ key: "r1", cells: { c1: { text: "busy" } } }]));
		fireEvent.mouseUp(window);
		expect(onSelectRange).not.toHaveBeenCalled();
	});

	it("drops the range when the row was opted out mid-press", () => {
		const onSelectRange = vi.fn();
		const cellRenderer = (
			cell: TestCell | undefined,
			context: MatrixCellContext<TestCell>,
		) => <span data-testid={`cell-${context.row.key}-${context.column.key}`} />;
		const grid = (rows: MatrixRow<TestCell>[]) => (
			<ThemeProvider theme={theme}>
				<MatrixGrid<TestCell>
					columns={COLUMNS}
					rows={rows}
					selectable={true}
					onSelectRange={onSelectRange}
					renderRowHeader={(row) => <span>{row.key}</span>}
					renderCell={cellRenderer}
				/>
			</ThemeProvider>
		);
		const { rerender } = render(grid([{ key: "r1", cells: {} }]));
		fireEvent.mouseDown(cellOf("r1", "c1"));
		fireEvent.mouseOver(cellOf("r1", "c3"));
		rerender(grid([{ key: "r1", cells: {}, selectable: false }]));
		fireEvent.mouseUp(window);
		expect(onSelectRange).not.toHaveBeenCalled();
	});

	it("drops the press when selection is switched off mid-drag", () => {
		const onSelectRange = vi.fn();
		const grid = (selectable: boolean) => (
			<ThemeProvider theme={theme}>
				<MatrixGrid<TestCell>
					columns={COLUMNS}
					rows={[{ key: "r1", cells: {} }]}
					selectable={selectable}
					onSelectRange={onSelectRange}
					renderRowHeader={(row) => <span>{row.key}</span>}
					renderCell={(cell, context) => (
						<span
							data-testid={`cell-${context.row.key}-${context.column.key}`}
						/>
					)}
				/>
			</ThemeProvider>
		);
		const { rerender } = render(grid(true));
		fireEvent.mouseDown(cellOf("r1", "c1"));
		expect(cellOf("r1", "c1").className).toContain(matrixClasses.cellSelected);
		rerender(grid(false));
		// the listeners are gone, so nothing could end or abort the range
		expect(cellOf("r1", "c1").className).not.toContain(
			matrixClasses.cellSelected,
		);
		rerender(grid(true));
		fireEvent.mouseUp(window);
		expect(onSelectRange).not.toHaveBeenCalled();
	});

	it("lays out an empty column set as empty, not as one column", () => {
		renderGrid({ columns: [] });
		const grid = document.querySelector(
			"[class*=CcMatrixGrid-grid]",
		) as HTMLElement;
		// repeat(0, …) would invalidate the whole declaration
		expect(grid.style.gridTemplateColumns).toBe("116px");
		expect(screen.getByText("header-r1")).toBeInTheDocument();
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

	it("offers a chip, not an overlay, on a cell that is not blank", () => {
		const onSelectRange = vi.fn();
		renderGrid({
			selectable: true,
			addLabel: "Add",
			isCellSelectable: () => true,
			onSelectRange,
		});
		fireEvent.mouseOver(cellOf("r1", "c1")); // blank: the whole-cell hint
		const hint = screen.getByText("Add");
		expect(getComputedStyle(hint).pointerEvents).toBe("none");
		fireEvent.mouseOut(cellOf("r1", "c1"));
		// holds an entry: a chip that is its own button, so what is drawn and
		// what can be clicked are the same thing
		fireEvent.mouseOver(cellOf("r1", "c2"));
		expect(screen.queryByText("Add")).not.toBeInTheDocument();
		const chip = screen.getByRole("button", { name: "Add" });
		fireEvent.click(chip);
		expect(onSelectRange).toHaveBeenCalledWith({
			rowKey: "r1",
			fromColumnKey: "c2",
			toColumnKey: "c2",
			columnKeys: ["c2"],
		});
	});

	it("reports the chip's cell once, not twice", () => {
		const onSelectRange = vi.fn();
		renderGrid({
			selectable: true,
			addLabel: "Add",
			isCellSelectable: () => true,
			onSelectRange,
		});
		fireEvent.mouseOver(cellOf("r1", "c2"));
		const chip = screen.getByRole("button", { name: "Add" });
		// a real click is mousedown + mouseup + click; the press must not also
		// begin a range on the cell underneath
		fireEvent.mouseDown(chip);
		fireEvent.mouseUp(window);
		fireEvent.click(chip);
		expect(onSelectRange).toHaveBeenCalledTimes(1);
	});

	it("activates the chip by keyboard", () => {
		const onSelectRange = vi.fn();
		renderGrid({
			selectable: true,
			addLabel: "Add",
			isCellSelectable: () => true,
			onSelectRange,
		});
		fireEvent.mouseOver(cellOf("r1", "c2"));
		const chip = screen.getByRole("button", { name: "Add" });
		expect(chip).toHaveAttribute("tabindex", "0");
		fireEvent.keyDown(chip, { key: "Enter" });
		expect(onSelectRange).toHaveBeenCalledWith(
			expect.objectContaining({ columnKeys: ["c2"] }),
		);
	});

	it("offers the same hint over the lower half when asked to", () => {
		const onSelectRange = vi.fn();
		renderGrid({
			selectable: true,
			addLabel: "Add",
			isCellSelectable: () => true,
			occupiedAddAffordance: "overlay",
			onSelectRange,
		});
		fireEvent.mouseOver(cellOf("r1", "c2")); // holds an entry
		// same look as on a blank cell, and no chip
		const hint = screen.getByText("Add");
		expect(hint.className).toContain(matrixClasses.addHintHalf);
		expect(
			screen.queryByRole("button", { name: "Add" }),
		).not.toBeInTheDocument();
		// half the cell, and it catches the pointer so a press starts a range
		expect(getComputedStyle(hint).pointerEvents).toBe("auto");
		fireEvent.mouseDown(hint);
		fireEvent.mouseUp(window);
		expect(onSelectRange).toHaveBeenCalledWith(
			expect.objectContaining({ columnKeys: ["c2"] }),
		);
	});

	it("keeps the blank-cell hint pointer-transparent in overlay mode", () => {
		renderGrid({
			selectable: true,
			addLabel: "Add",
			isCellSelectable: () => true,
			occupiedAddAffordance: "overlay",
		});
		fireEvent.mouseOver(cellOf("r1", "c1")); // blank
		const hint = screen.getByText("Add");
		expect(hint.className).not.toContain(matrixClasses.addHintHalf);
		expect(getComputedStyle(hint).pointerEvents).toBe("none");
	});

	it("draws no affordance at all where a range may not start", () => {
		renderGrid({ selectable: true, addLabel: "Add" }); // default predicate
		// c2 holds an entry, so the default predicate rejects it
		expect(
			cellOf("r1", "c2").querySelector("[data-cc-matrix-add-chip]"),
		).toBeNull();
		fireEvent.mouseOver(cellOf("r1", "c2"));
		expect(screen.queryByText("Add")).not.toBeInTheDocument();
		expect(
			cellOf("r1", "c2").querySelector("[data-cc-matrix-add-chip]"),
		).toBeNull();
		// and a whole row that opted out gets neither hint nor chip
		fireEvent.mouseOver(cellOf("r2", "c1"));
		expect(screen.queryByText("Add")).not.toBeInTheDocument();
	});

	it("draws no pointer-catching overlay where a range may not start", () => {
		renderGrid({
			selectable: true,
			addLabel: "Add",
			occupiedAddAffordance: "overlay",
		});
		// c2 is occupied and rejected by the default predicate: an overlay here
		// would read as a target, eat the press and do nothing
		fireEvent.mouseOver(cellOf("r1", "c2"));
		expect(screen.queryByText("Add")).not.toBeInTheDocument();
	});

	it("keeps the chip in the DOM, so a keyboard can reach it", () => {
		const onSelectRange = vi.fn();
		renderGrid({
			selectable: true,
			addLabel: "Add",
			isCellSelectable: () => true,
			onSelectRange,
		});
		// no pointer has been anywhere near the grid
		const chip = screen.getByRole("button", { name: "Add" });
		expect(chip).toHaveAttribute("tabindex", "0");
		expect(cellOf("r1", "c2")).toContainElement(chip);
		chip.focus();
		expect(document.activeElement).toBe(chip);
		fireEvent.keyDown(chip, { key: "Enter" });
		expect(onSelectRange).toHaveBeenCalledWith(
			expect.objectContaining({ columnKeys: ["c2"] }),
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

		it("is one tab stop with arrow keys, not one stop per column", () => {
			renderGrid({ extraRows });
			const cells = screen.getAllByRole("button");
			const stops = cells.filter(
				(cell) => cell.getAttribute("tabindex") === "0",
			);
			expect(cells).toHaveLength(4); // one per column
			expect(stops).toHaveLength(1); // but one way in
			fireEvent.keyDown(stops[0], { key: "ArrowRight" });
			expect(document.activeElement).toBe(cells[1]);
			fireEvent.keyDown(cells[1], { key: "End" });
			expect(document.activeElement).toBe(cells[3]);
			fireEvent.keyDown(cells[3], { key: "Home" });
			expect(document.activeElement).toBe(cells[0]);
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

		it("fires the row action once, not once per auto-repeat tick", () => {
			const onRowHeaderActions = vi.fn();
			renderGrid({ onRowHeaderActions });
			const header = screen.getByLabelText("Row one");
			fireEvent.keyDown(header, { key: " " });
			fireEvent.keyDown(header, { key: " ", repeat: true });
			fireEvent.keyDown(header, { key: " ", repeat: true });
			expect(onRowHeaderActions).toHaveBeenCalledTimes(1);
		});

		it("shows no add hint, because there is no hover", () => {
			renderGrid({ selectable: true, addLabel: "Add" });
			fireEvent.mouseOver(cellOf("r1", "c1"));
			expect(screen.queryByText("Add")).not.toBeInTheDocument();
		});

		it("falls back to a visible chip on an occupied cell, in either mode", () => {
			const onSelectRange = vi.fn();
			const { rerender } = wrap(
				<MatrixGrid<TestCell>
					columns={COLUMNS}
					rows={ROWS}
					selectable={true}
					addLabel={"Add"}
					isCellSelectable={() => true}
					occupiedAddAffordance={"overlay"}
					onSelectRange={onSelectRange}
					renderRowHeader={(row) => <span>{`header-${row.key}`}</span>}
					renderCell={(cell, context) => (
						<span
							data-testid={`cell-${context.row.key}-${context.column.key}`}
						/>
					)}
				/>,
			);
			// overlay mode, but a tablet has no hover to reveal it with
			const chip = screen.getByRole("button", { name: "Add" });
			expect(getComputedStyle(chip).opacity).toBe("1");
			fireEvent.click(chip);
			expect(onSelectRange).toHaveBeenCalledWith(
				expect.objectContaining({ columnKeys: ["c2"] }),
			);
			rerender(
				<ThemeProvider theme={theme}>
					<MatrixGrid<TestCell>
						columns={COLUMNS}
						rows={ROWS}
						selectable={true}
						addLabel={"Add"}
						isCellSelectable={() => true}
						onSelectRange={onSelectRange}
						renderRowHeader={(row) => <span>{`header-${row.key}`}</span>}
						renderCell={() => null}
					/>
				</ThemeProvider>,
			);
			expect(
				getComputedStyle(screen.getByRole("button", { name: "Add" })).opacity,
			).toBe("1");
		});
	});

	describe("scrolling to a column", () => {
		let writes: number[] = [];
		let offsetDescriptor: PropertyDescriptor | undefined;
		let scrollDescriptor: PropertyDescriptor | undefined;
		beforeEach(() => {
			writes = [];
			// keep jsdom's own accessors, so later tests are not left with
			// offsetLeft === undefined
			offsetDescriptor = Object.getOwnPropertyDescriptor(
				HTMLElement.prototype,
				"offsetLeft",
			);
			scrollDescriptor = Object.getOwnPropertyDescriptor(
				Element.prototype,
				"scrollLeft",
			);
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
			if (offsetDescriptor)
				Object.defineProperty(
					HTMLElement.prototype,
					"offsetLeft",
					offsetDescriptor,
				);
			if (scrollDescriptor)
				Object.defineProperty(
					Element.prototype,
					"scrollLeft",
					scrollDescriptor,
				);
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

		it("falls back to the current column when scrollToColumn is gone", () => {
			// a consumer holding a key in state while the window rolled past it
			render(
				<ThemeProvider theme={theme}>
					<MatrixGrid<TestCell>
						columns={COLUMNS.map(current("c3"))}
						rows={ROWS}
						columnWidth={50}
						rowHeaderWidth={100}
						scrollToColumn={"c9"}
						renderRowHeader={(row) => <span>{row.key}</span>}
						renderCell={() => null}
					/>
				</ThemeProvider>,
			);
			expect(writes).toEqual([450]); // c3, not "no target at all"
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

	it("makes a clickable entry reachable by keyboard", () => {
		const onItemClick = vi.fn();
		wrap(<MatrixCellTile items={[item("a")]} onItemClick={onItemClick} />);
		const entry = screen.getByRole("button");
		expect(entry).toHaveAttribute("tabindex", "0");
		fireEvent.keyDown(entry, { key: "Enter" });
		expect(onItemClick).toHaveBeenCalledWith(
			expect.objectContaining({ key: "a" }),
		);
		fireEvent.keyDown(entry, { key: " ", repeat: true });
		expect(onItemClick).toHaveBeenCalledTimes(1);
	});

	it("leaves a non-clickable entry out of the tab order", () => {
		wrap(<MatrixCellTile items={[item("a")]} />);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("derives a readable label color from the fill", () => {
		// the library's own rule, so a consumer raising contrastThreshold moves
		// tile labels with everything else
		const { container } = wrap(
			<MatrixCellTile items={[item("a", { backgroundColor: "#ffffff" })]} />,
		);
		const entry = container.querySelector("[class*=item]") as HTMLElement;
		expect(entry.style.getPropertyValue("--cc-matrix-tile-fg")).toBe(
			theme.palette.getContrastText("#ffffff"),
		);
		cleanup();
		const dark = wrap(
			<MatrixCellTile items={[item("b", { backgroundColor: "#1a237e" })]} />,
		);
		const darkEntry = dark.container.querySelector(
			"[class*=item]",
		) as HTMLElement;
		expect(darkEntry.style.getPropertyValue("--cc-matrix-tile-fg")).toBe(
			theme.palette.getContrastText("#1a237e"),
		);
		expect(theme.palette.getContrastText("#1a237e")).not.toBe(
			theme.palette.getContrastText("#ffffff"),
		);
	});

	it("never draws the secondary label larger than the primary", () => {
		const { container } = wrap(
			<MatrixCellTile
				items={[item("a", { label: "ABCD", secondaryLabel: "X" })]}
			/>,
		);
		const entry = container.querySelector("[class*=item]") as HTMLElement;
		const primary = entry.style.getPropertyValue("--cc-matrix-tile-font-size");
		const secondary = entry.style.getPropertyValue(
			"--cc-matrix-tile-secondary-font-size",
		);
		expect(parseFloat(secondary)).toBeLessThanOrEqual(parseFloat(primary));
	});

	it("keeps an explicit text color", () => {
		const { container } = wrap(
			<MatrixCellTile
				items={[
					item("a", { backgroundColor: "#ffffff", textColor: "#ff0000" }),
				]}
			/>,
		);
		const entry = container.querySelector("[class*=item]") as HTMLElement;
		expect(entry.style.getPropertyValue("--cc-matrix-tile-fg")).toBe("#ff0000");
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
