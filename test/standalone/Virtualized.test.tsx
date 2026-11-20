import React from "react";
import {
	describe,
	it,
	expect,
	vi,
	beforeAll,
	afterAll,
	afterEach,
} from "vitest";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import MultiGrid, {
	MultiGridProps,
} from "../../src/standalone/Virtualized/MultiGrid";
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

// jsdom keeps scrollLeft/scrollTop but has no Element.prototype.scrollTo. This
// stand-in writes the position like a browser does, without the scroll event
// (tests that need one fire it themselves).
const originalScrollTo = Object.getOwnPropertyDescriptor(
	Element.prototype,
	"scrollTo",
);
beforeAll(() => {
	Element.prototype.scrollTo = function scrollTo(
		this: Element,
		options?: ScrollToOptions | number,
		y?: number,
	) {
		if (typeof options === "number") {
			this.scrollLeft = options;
			this.scrollTop = y ?? this.scrollTop;
			return;
		}
		if (options?.left != null) this.scrollLeft = options.left;
		if (options?.top != null) this.scrollTop = options.top;
	};
});
afterAll(() => {
	if (originalScrollTo) {
		Object.defineProperty(Element.prototype, "scrollTo", originalScrollTo);
	} else {
		delete (Element.prototype as Partial<Element>).scrollTo;
	}
});

// without this, trees (and the document keydown listener of globalScrollListener)
// leak into the next test
afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.restoreAllMocks();
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

const props = (overrides: Partial<MultiGridProps> = {}): MultiGridProps => ({
	...defaultProps,
	label: "Grid",
	...overrides,
});

/**
 * The first four children of the root, in the order the JSX fixes: top left, top
 * right (pinned rows), bottom left (pinned columns), bottom right (the scrolling
 * pane, or the no-content placeholder while there are no data rows).
 */
const panes = (container: HTMLElement) => {
	const root = container.firstElementChild as HTMLElement;
	const [tl, tr, bl, br] = Array.from(root.children) as HTMLElement[];
	return { root, tl, tr, bl, br };
};

/** sets a pane's scroll position and fires the scroll event a browser would */
const scrollPane = (
	pane: HTMLElement,
	position: { left?: number; top?: number },
) => {
	if (position.left != null) pane.scrollLeft = position.left;
	if (position.top != null) pane.scrollTop = position.top;
	fireEvent.scroll(pane);
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

describe("MultiGrid scroll sync", () => {
	it("[ISSUE-3472-ITEM-1] scrolling the header pane scrolls the body to the same position", () => {
		const { container } = render(<MultiGrid {...props()} />);
		const { tr, br } = panes(container);
		scrollPane(tr, { left: 300 });
		expect(br.scrollLeft).toBe(300);
	});

	it("[ISSUE-3472-ITEM-1] does not let the header's echo of a body scroll drag the body back", () => {
		vi.useFakeTimers();
		const { container } = render(<MultiGrid {...props()} />);
		const { tr, br } = panes(container);
		scrollPane(br, { left: 100 });
		expect(tr.scrollLeft).toBe(100);

		// the body is still moving (momentum) when the header reports the
		// position it was given
		br.scrollLeft = 150;
		fireEvent.scroll(tr);
		expect(br.scrollLeft).toBe(150);

		// once things have settled, a scroll of the header moves the body again
		act(() => {
			vi.advanceTimersByTime(500);
		});
		scrollPane(tr, { left: 300 });
		expect(br.scrollLeft).toBe(300);
	});

	it("[ISSUE-3472-ITEM-1] does not let the body's echo of a header scroll drag the header back", () => {
		vi.useFakeTimers();
		const { container } = render(<MultiGrid {...props()} />);
		const { tr, br } = panes(container);
		scrollPane(tr, { left: 300 });
		expect(br.scrollLeft).toBe(300);

		// the next focused header button moved the header on before the body
		// reports the position it was given
		tr.scrollLeft = 400;
		fireEvent.scroll(br);
		expect(tr.scrollLeft).toBe(400);
	});

	it("[ISSUE-3472-ITEM-1] sets the header's overflow itself: it scrolls sideways only while there are no data rows", () => {
		const scrollingHeader = { overflow: "scroll" } as const;
		const { container, rerender } = render(
			<MultiGrid {...props({ styleTopRightGrid: scrollingHeader })} />,
		);
		const { tr } = panes(container);
		// the body is the horizontal scroller, the header follows it
		expect(tr).toHaveStyle({ overflowX: "hidden", overflowY: "hidden" });

		rerender(
			<MultiGrid
				{...props({ rowCount: 1, styleTopRightGrid: scrollingHeader })}
			/>,
		);
		// no body: the header is the horizontal scroller (and the tab stop)
		expect(tr).toHaveStyle({ overflowX: "auto", overflowY: "hidden" });
	});
});

describe("MultiGrid focus ring", () => {
	/** the box that draws the tab stop's focus ring: last, so painted above the panes */
	const focusRing = (container: HTMLElement) =>
		container.firstElementChild?.lastElementChild as HTMLElement;

	it("[ISSUE-3472-ITEM-10] covers the pane that is the tab stop, and the header pane once the rows go", () => {
		const { container, rerender } = render(<MultiGrid {...props()} />);
		expect(focusRing(container)).not.toBe(panes(container).br);
		// the scrolling pane: below the 35px header, right of the 100px pinned column
		expect(focusRing(container)).toHaveStyle({
			top: "35px",
			left: "100px",
			width: "500px",
			height: "365px",
		});

		rerender(<MultiGrid {...props({ rowCount: 1 })} />);
		expect(panes(container).tr).toHaveAttribute("tabindex", "0");
		expect(focusRing(container)).toHaveStyle({
			top: "0px",
			left: "100px",
			width: "500px",
			height: "35px",
		});
	});

	it("[ISSUE-3472-ITEM-10] takes the theme's focusRing style overrides", () => {
		const theme = createTheme({
			components: {
				CcMultiGrid: {
					styleOverrides: { focusRing: { outlineColor: "rgb(1, 2, 3)" } },
				},
			},
		});
		const { container } = render(
			<ThemeProvider theme={theme}>
				<MultiGrid {...props()} />
			</ThemeProvider>,
		);
		expect(focusRing(container)).not.toBe(panes(container).br);
		expect(getComputedStyle(focusRing(container)).outlineColor).toBe(
			"rgb(1, 2, 3)",
		);
	});
});

/**
 * Sets its own role and grid-wide column index on the header row's cells, and
 * neither on the others
 */
const HeaderRoleCellRenderer = ({
	columnIndex,
	rowIndex,
	style,
}: CellComponentProps) => (
	<div
		style={style}
		{...(rowIndex === 0 && {
			role: "columnheader",
			"aria-colindex": columnIndex + 1,
		})}
		data-testid={`cell-${rowIndex}-${columnIndex}`}
	>
		R{rowIndex}C{columnIndex}
	</div>
);

describe("MultiGrid ARIA structure", () => {
	it("[ISSUE-3472-ITEM-11] every row of every pane has its cells, though the renderer drops ariaAttributes", () => {
		const { container } = render(<MultiGrid {...props()} />);
		const { tl, tr, bl, br } = panes(container);
		for (const [name, pane] of Object.entries({ tl, tr, bl, br })) {
			const rows = Array.from(pane.querySelectorAll("[role='row']"));
			expect(rows.length, name).toBeGreaterThan(0);
			for (const row of rows) {
				// what react-window put into the row: its cells
				const cells = Array.from(row.children);
				expect(cells.length, name).toBeGreaterThan(0);
				for (const cell of cells) {
					expect(cell, name).toHaveAttribute("role", "gridcell");
					expect(cell, name).toHaveAttribute("aria-colindex");
				}
			}
		}
	});

	it("[ISSUE-3472-ITEM-11] keeps the role and column index a renderer sets itself", () => {
		const { getByTestId } = render(
			<MultiGrid {...props({ children: HeaderRoleCellRenderer })} />,
		);
		expect(getByTestId("cell-0-2")).toHaveAttribute("role", "columnheader");
		expect(getByTestId("cell-0-2")).toHaveAttribute("aria-colindex", "3");
		expect(getByTestId("cell-0-0")).toHaveAttribute("role", "columnheader");
		expect(getByTestId("cell-1-2")).toHaveAttribute("role", "gridcell");
		expect(getByTestId("cell-1-0")).toHaveAttribute("role", "gridcell");
	});
});
