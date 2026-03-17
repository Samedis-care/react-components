import React from "react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import MultiGrid from "../../src/standalone/Virtualized/MultiGrid";
import type { CellComponentProps } from "react-window";

// react-window depends on DOM measurements; stub ResizeObserver globally
beforeAll(() => {
	global.ResizeObserver = vi.fn(() => ({
		observe: vi.fn(),
		unobserve: vi.fn(),
		disconnect: vi.fn(),
	})) as unknown as typeof ResizeObserver;
});

const NoContent = () => <div data-testid="no-content">No content</div>;

const CellRenderer = ({ columnIndex, rowIndex, style }: CellComponentProps) => (
	<div style={style} data-testid={`cell-${rowIndex}-${columnIndex}`}>
		R{rowIndex}C{columnIndex}
	</div>
);

const defaultProps = {
	width: 600,
	height: 400,
	columnCount: 5,
	columnWidth: () => 100,
	rowCount: 20,
	rowHeight: () => 35,
	fixedColumnCount: 1,
	fixedRowCount: 1,
	styleTopLeftGrid: {},
	styleTopRightGrid: {},
	styleBottomLeftGrid: {},
	styleBottomRightGrid: {},
	children: CellRenderer,
	noContentRenderer: NoContent,
} as const;

describe("MultiGrid smoke tests", () => {
	it("renders without crashing", () => {
		expect(() => render(<MultiGrid {...defaultProps} />)).not.toThrow();
	});

	it("renders the root container with the correct dimensions", () => {
		const { container } = render(<MultiGrid {...defaultProps} />);
		// The Root styled div gets inline width/height
		const root = container.querySelector("div");
		expect(root).toBeTruthy();
	});

	it("renders NoContentRenderer when there are no scrollable rows", () => {
		const { getByTestId } = render(
			<MultiGrid
				{...defaultProps}
				rowCount={1} // only the fixed header row — no bottom rows
			/>,
		);
		expect(getByTestId("no-content")).toBeInTheDocument();
	});

	it("accepts globalScrollListener without crashing", () => {
		expect(() =>
			render(<MultiGrid {...defaultProps} globalScrollListener />),
		).not.toThrow();
	});

	it("handles zero fixed columns/rows", () => {
		expect(() =>
			render(
				<MultiGrid {...defaultProps} fixedColumnCount={0} fixedRowCount={0} />,
			),
		).not.toThrow();
	});

	it("accepts an onCellsRendered callback", () => {
		const onCellsRendered = vi.fn();
		expect(() =>
			render(<MultiGrid {...defaultProps} onCellsRendered={onCellsRendered} />),
		).not.toThrow();
	});
});
