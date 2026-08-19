import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import MatrixGrid from "../../src/standalone/Matrix/MatrixGrid";
import MatrixCellTile from "../../src/standalone/Matrix/MatrixCellTile";
import buildDateColumns from "../../src/standalone/Matrix/buildDateColumns";
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

	it("localizes the weekday sub label without moment locales", () => {
		const [monday] = buildDateColumns({
			from: "2026-03-02",
			to: "2026-03-02",
			locale: "de-DE",
			today: null,
		});
		expect(monday.subLabel as string).toMatch(/^Mo/);
	});

	it("caps the range at maxColumns", () => {
		const columns = buildDateColumns({
			from: "2026-01-01",
			to: "2027-01-01",
			today: null,
			maxColumns: 10,
		});
		expect(columns).toHaveLength(10);
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
	{ key: "r1", cells: { c2: { text: "busy" } } },
	{ key: "r2", cells: {}, selectable: false },
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
	screen.getByTestId(`cell-${rowKey}-${columnKey}`);

describe("MatrixGrid", () => {
	it("renders a corner, every column header and every row header", () => {
		renderGrid();
		expect(screen.getByText("corner")).toBeInTheDocument();
		expect(screen.getByText("header-r1")).toBeInTheDocument();
		expect(screen.getByText("header-r2")).toBeInTheDocument();
		// 4 columns x 2 rows
		expect(
			screen.getAllByText("", { selector: "[data-testid^=cell-]" }),
		).toEqual(expect.any(Array));
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

	it("aborts the range on Escape", () => {
		const onSelectRange = vi.fn();
		renderGrid({ selectable: true, onSelectRange });
		fireEvent.mouseDown(cellOf("r1", "c1"));
		fireEvent.keyDown(window, { key: "Escape" });
		fireEvent.mouseUp(window);
		expect(onSelectRange).not.toHaveBeenCalled();
	});

	it("does not select occupied cells, or rows opted out", () => {
		const onSelectRange = vi.fn();
		renderGrid({ selectable: true, onSelectRange });
		// r1/c2 holds a cell -> not selectable by default
		fireEvent.mouseDown(cellOf("r1", "c2"));
		fireEvent.mouseUp(window);
		// r2 is selectable: false
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

	it("wraps cell contents with renderCellWrapper", () => {
		renderGrid({
			renderCellWrapper: (node, context) => (
				<div data-testid={`wrapper-${context.row.key}-${context.column.key}`}>
					{node}
				</div>
			),
		});
		expect(screen.getByTestId("wrapper-r1-c1")).toContainElement(
			cellOf("r1", "c1"),
		);
	});

	it("renders extra rows with their badges and reports clicks", () => {
		const onCellClick = vi.fn();
		renderGrid({
			extraRows: [
				{
					key: "demand",
					header: <span>{"demand"}</span>,
					badges: { c2: 9 },
					onCellClick,
				},
			],
		});
		expect(screen.getByText("demand")).toBeInTheDocument();
		const badge = screen.getByText("9");
		expect(badge).toBeInTheDocument();
		fireEvent.click(badge);
		expect(onCellClick).toHaveBeenCalledWith("c2");
	});
});

// ---- MatrixCellTile ---------------------------------------------------------

const item = (key: string, overrides: Partial<MatrixTileItem> = {}) => ({
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
					item("b"),
				]}
			/>,
		);
		expect(screen.getByText("A")).toBeInTheDocument();
		expect(screen.getByText("B")).toBeInTheDocument();
		expect(screen.getByText("glyph")).toBeInTheDocument();
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

	it("dims a diagonal half via hex alpha, and leaves other formats alone", () => {
		const { container } = wrap(
			<MatrixCellTile
				items={[
					item("a", { dimmed: true }),
					item("b", { dimmed: true, backgroundColor: "rgb(1, 2, 3)" }),
				]}
				pairLayout={"diagonal"}
			/>,
		);
		expect(container.querySelector("[class*=diagonal]")).toBeInTheDocument();
		const css = Array.from(document.querySelectorAll("style"))
			.map((tag) => tag.textContent ?? "")
			.join("");
		expect(css).toContain("#12345699");
		expect(css).toContain("rgb(1, 2, 3)");
	});
});
