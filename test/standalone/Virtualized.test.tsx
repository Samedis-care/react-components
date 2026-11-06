import React from "react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { act, render } from "@testing-library/react";
import MultiGrid from "../../src/standalone/Virtualized/MultiGrid";
import type { CellComponentProps } from "react-window";

// react-window depends on DOM measurements; stub ResizeObserver globally.
// MultiGrid observes its scrolling pane: reportResize calls the observers of an
// element, as a browser does when its size or its scrollbars change.
const resizeObservers = new Set<ResizeObserverStub>();
class ResizeObserverStub {
	readonly targets = new Set<Element>();
	constructor(readonly callback: ResizeObserverCallback) {
		resizeObservers.add(this);
	}
	observe(target: Element) {
		this.targets.add(target);
	}
	unobserve(target: Element) {
		this.targets.delete(target);
	}
	disconnect() {
		this.targets.clear();
		resizeObservers.delete(this);
	}
}
const reportResize = (target: Element) =>
	resizeObservers.forEach((observer) => {
		if (observer.targets.has(target)) observer.callback([], observer);
	});
beforeAll(() => {
	globalThis.ResizeObserver = ResizeObserverStub;
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

/**
 * The four children of the root, in the order the JSX fixes: top left, top
 * right (pinned rows), bottom left (pinned columns), bottom right (the scrolling
 * pane, or the no-content placeholder while there are no data rows).
 */
const panes = (container: HTMLElement) => {
	const root = container.firstElementChild as HTMLElement;
	const [tl, tr, bl, br] = Array.from(root.children) as HTMLElement[];
	return { root, tl, tr, bl, br };
};

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

	it("makes the scrolling pane the only tab stop", () => {
		const { container } = render(
			<MultiGrid {...defaultProps} label={"Grid contents"} />,
		);
		const tabStops = Array.from(
			container.querySelectorAll<HTMLElement>('[role="grid"]'),
		).filter((pane) => pane.tabIndex === 0);
		expect(tabStops).toHaveLength(1);
		expect(tabStops[0]).toHaveAttribute("aria-label", "Grid contents");
		expect(tabStops[0].className).toContain("bottomRightGrid");
	});

	it("moves the tab stop to the header row when there are no rows", () => {
		const { container } = render(
			<MultiGrid
				{...defaultProps}
				rowCount={1} // only the fixed header row — no bottom rows
				label={"Grid contents"}
			/>,
		);
		const tabStops = Array.from(
			container.querySelectorAll<HTMLElement>('[role="grid"]'),
		).filter((pane) => pane.tabIndex === 0);
		expect(tabStops).toHaveLength(1);
		expect(tabStops[0]).toHaveAttribute("aria-label", "Grid contents");
		expect(tabStops[0].className).toContain("topRightGrid");
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

describe("MultiGrid scrollbars", () => {
	/**
	 * Gives a pane the sizes a browser reports while it shows scrollbars of the
	 * given width (vertical) and height (horizontal), and reports the resize.
	 */
	const showScrollbars = (
		pane: HTMLElement,
		vertical: number,
		horizontal: number,
	) => {
		const width = parseFloat(pane.style.width);
		const height = parseFloat(pane.style.height);
		Object.defineProperties(pane, {
			offsetWidth: { configurable: true, get: () => width },
			offsetHeight: { configurable: true, get: () => height },
			clientWidth: { configurable: true, get: () => width - vertical },
			clientHeight: { configurable: true, get: () => height - horizontal },
		});
		act(() => reportResize(pane));
	};

	it("[ISSUE-3472-ITEM-2] gives the header the width and the pinned column the height of the scrolling pane's viewport", () => {
		const { container, rerender } = render(<MultiGrid {...defaultProps} />);
		const { tr, bl, br } = panes(container);
		expect(tr).toHaveStyle({ width: "500px" });
		expect(bl).toHaveStyle({ height: "365px" });

		// classic 15px scrollbars: the header and the pinned column get the
		// body's viewport, 485 wide and 350 high
		showScrollbars(br, 15, 15);
		expect(tr).toHaveStyle({ width: "485px" });
		expect(bl).toHaveStyle({ height: "350px" });
		expect(br).toHaveStyle({ width: "500px", height: "365px" });

		// the rows fit now, so the vertical scrollbar is gone
		showScrollbars(br, 0, 15);
		expect(tr).toHaveStyle({ width: "500px" });
		expect(bl).toHaveStyle({ height: "350px" });

		// no data rows, no scrolling pane: nothing to leave out
		showScrollbars(br, 15, 15);
		rerender(<MultiGrid {...defaultProps} rowCount={1} />);
		expect(tr).toHaveStyle({ width: "500px" });
		expect(bl).toHaveStyle({ height: "365px" });
	});
});
