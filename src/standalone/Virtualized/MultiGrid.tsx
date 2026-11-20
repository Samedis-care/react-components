import React, {
	CSSProperties,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	CellComponentProps,
	Grid as VGrid,
	GridProps,
	GridImperativeAPI,
} from "react-window";
import { CSSObject, styled, useThemeProps } from "@mui/material";

/**
 * Most props do the same as in react-virtualized MultiGrid component
 * Otherwise they are commented
 */
export interface MultiGridProps {
	width: number;
	height: number;
	columnCount: number;
	columnWidth: (column: number) => number;
	rowCount: number;
	rowHeight: (row: number) => number;
	onCellsRendered?: GridProps<object>["onCellsRendered"];
	fixedColumnCount: number;
	fixedRowCount: number;
	styleTopLeftGrid: CSSProperties;
	/**
	 * Extra inline style for the top-right pane: the pinned rows right of the
	 * pinned columns, i.e. the header. MultiGrid sets its position, size and
	 * overflow, which win over this style. While there are data rows the user
	 * cannot scroll the header: it follows the body's horizontal position, and
	 * when the browser scrolls it to reveal an element focused in it, the body
	 * follows the header. While there are none it scrolls sideways itself and is
	 * the tab stop.
	 */
	styleTopRightGrid: CSSProperties;
	styleBottomLeftGrid: CSSProperties;
	styleBottomRightGrid: CSSProperties;
	/**
	 * Renders one cell. It gets react-window's cell props, with grid-wide
	 * `columnIndex`/`rowIndex` in every pane, and returns the cell's element.
	 * Apply `style` to that element: it positions and sizes the cell.
	 *
	 * MultiGrid puts `ariaAttributes` (`role="gridcell"` and `aria-colindex`) on
	 * the returned element unless the element sets them itself, so every row
	 * has its cells for assistive technology whether or not the renderer
	 * spreads them. When the returned element is one of a component of your
	 * own, that component has to pass them on to its DOM element, as it does
	 * `style`.
	 *
	 * All four panes call it as a function, so its hooks belong to the pane's
	 * own cell component, which react-window memoizes.
	 */
	children: (props: CellComponentProps) => React.ReactElement;
	noContentRenderer: React.ComponentType;
	/**
	 * Accessible name for the scrolling pane, which is a tab stop
	 * (arrow keys, page up/down and home/end scroll it once focused)
	 */
	label?: string;
	/**
	 * Enable global scrolling listener (enables page up/down scrolling).
	 * One page is the height the scrolling pane shows.
	 */
	globalScrollListener?: boolean;
}

const Root = styled("div", { name: "CcMultiGrid", slot: "root" })({
	position: "absolute",
});

// the class of the pane that is the tab stop
const TAB_STOP_CLASS = "CcMultiGrid-tabStop";

// The tab stop draws no outline of its own: the browser paints the outline of
// a scroll container under its cells, which are positioned, so opaque cells
// hide it. The focusRing slot draws the ring above them instead.
const tabStopStyles: CSSObject = {
	[`&.${TAB_STOP_CLASS}:focus-visible`]: {
		outline: "none",
	},
};

const TopRightVariableSizeGrid = styled(VGrid, {
	name: "CcMultiGrid",
	slot: "topRightGrid",
})(tabStopStyles);

const BottomLeftVariableSizeGrid = styled(VGrid, {
	name: "CcMultiGrid",
	slot: "bottomLeftGrid",
})({
	// scrolls with the body pane but shows no scrollbars of its own: its height
	// leaves out the body's horizontal scrollbar instead
	scrollbarWidth: "none",
	// Safari before 18.2 has no scrollbar-width
	"&::-webkit-scrollbar": {
		display: "none",
	},
});

const BottomRightVariableSizeGrid = styled(VGrid, {
	name: "CcMultiGrid",
	slot: "bottomRightGrid",
})(tabStopStyles);

// The focus ring of the tab stop: a box over the pane, so the ring is painted
// above the pane's cells, shown while the pane has keyboard focus. It is an
// outline (forced colors keep outlines) inside the pane's edges, where no
// ancestor can clip it, and it lets clicks through to the cells.
const FocusRing = styled("div", { name: "CcMultiGrid", slot: "focusRing" })(
	({ theme }) => ({
		position: "absolute",
		pointerEvents: "none",
		outline: `2px solid ${theme.palette.primary.main}`,
		outlineOffset: -2,
		display: "none",
		[`.${TAB_STOP_CLASS}:focus-visible ~ &`]: {
			display: "block",
		},
	}),
);

/**
 * Theme slots of `CcMultiGrid` (`theme.components.CcMultiGrid.styleOverrides`):
 * `root`, `topRightGrid` (the pinned rows, i.e. the header), `bottomLeftGrid`
 * (the pinned columns), `bottomRightGrid` (the scrolling pane) and `focusRing`
 * (the focus ring of the pane that is the tab stop: a 2px outline in
 * `palette.primary.main` inside that pane's edges, drawn by a box over the
 * pane while the pane has keyboard focus; restyle it with e.g. `outlineColor`).
 */
export type MultiGridClassKey =
	"root" | "topRightGrid" | "bottomLeftGrid" | "bottomRightGrid" | "focusRing";

/**
 * Room in px that the body pane's scrollbars (and borders, if any) take from
 * its viewport
 */
interface ScrollbarSizes {
	/** width of the vertical scrollbar */
	vertical: number;
	/** height of the horizontal scrollbar */
	horizontal: number;
}

const NO_SCROLLBARS: ScrollbarSizes = { vertical: 0, horizontal: 0 };

const SCROLL_DETECTION_DELAY_MS = 100; // ms to consider scroll events caused by JS code

/** the attributes of a cell that make it one of its row's cells */
interface CellAria {
	role?: string;
	"aria-colindex"?: number;
}

/**
 * The cell element a cell renderer returned, with react-window's
 * `ariaAttributes` on it: react-window renders the `role="row"` elements and
 * leaves the cell role to the renderer. A role or column index the element
 * sets itself (e.g. `role="columnheader"`) stays.
 */
const withCellAria = (
	cell: React.ReactElement,
	ariaAttributes: CellComponentProps["ariaAttributes"],
): React.ReactElement => {
	const own = cell.props as CellAria;
	return React.cloneElement(cell as React.ReactElement<CellAria>, {
		role: own.role ?? ariaAttributes.role,
		"aria-colindex": own["aria-colindex"] ?? ariaAttributes["aria-colindex"],
	});
};

const MultiGrid = (inProps: MultiGridProps) => {
	const props = useThemeProps({ props: inProps, name: "CcMultiGrid" });
	const {
		width,
		height,
		columnCount,
		columnWidth,
		rowCount,
		rowHeight,
		onCellsRendered,
		fixedColumnCount,
		fixedRowCount,
		styleTopLeftGrid,
		styleTopRightGrid,
		styleBottomLeftGrid,
		styleBottomRightGrid,
		children: CellRenderer,
		noContentRenderer: NoContentRenderer,
		label,
		globalScrollListener,
	} = props;

	const fixedWidth = useMemo(
		() =>
			Array.from(new Array(fixedColumnCount).keys()).reduce(
				(p, c) => p + columnWidth(c),
				0,
			),
		[columnWidth, fixedColumnCount],
	);
	const fixedHeight = useMemo(
		() =>
			Array.from(new Array(fixedRowCount).keys()).reduce(
				(p, c) => p + rowHeight(c),
				0,
			),
		[fixedRowCount, rowHeight],
	);

	// The cell components of the four panes: each calls the renderer with
	// grid-wide indices and makes what it returns a cell of its row
	const CellRendererTopLeft = useCallback(
		(props: CellComponentProps) =>
			withCellAria(CellRenderer(props), props.ariaAttributes),
		[CellRenderer],
	);
	const CellRendererTopRight = useCallback(
		(props: CellComponentProps) =>
			withCellAria(
				CellRenderer({
					...props,
					columnIndex: props.columnIndex + fixedColumnCount,
				}),
				props.ariaAttributes,
			),
		[CellRenderer, fixedColumnCount],
	);
	const CellRendererBottomLeft = useCallback(
		(props: CellComponentProps) =>
			withCellAria(
				CellRenderer({
					...props,
					rowIndex: props.rowIndex + fixedRowCount,
				}),
				props.ariaAttributes,
			),
		[CellRenderer, fixedRowCount],
	);
	const CellRendererBottomRight = useCallback(
		(props: CellComponentProps) =>
			withCellAria(
				CellRenderer({
					...props,
					columnIndex: props.columnIndex + fixedColumnCount,
					rowIndex: props.rowIndex + fixedRowCount,
				}),
				props.ariaAttributes,
			),
		[CellRenderer, fixedColumnCount, fixedRowCount],
	);

	const handleCellsRendered = useCallback(
		(
			visibleCells: {
				columnStartIndex: number;
				columnStopIndex: number;
				rowStartIndex: number;
				rowStopIndex: number;
			},
			allCells: {
				columnStartIndex: number;
				columnStopIndex: number;
				rowStartIndex: number;
				rowStopIndex: number;
			},
		) => {
			if (!onCellsRendered) return;
			onCellsRendered(
				{
					columnStartIndex: visibleCells.columnStartIndex + fixedColumnCount,
					columnStopIndex: visibleCells.columnStopIndex + fixedColumnCount,
					rowStartIndex: visibleCells.rowStartIndex + fixedRowCount,
					rowStopIndex: visibleCells.rowStopIndex + fixedRowCount,
				},
				{
					columnStartIndex: allCells.columnStartIndex + fixedColumnCount,
					columnStopIndex: allCells.columnStopIndex + fixedColumnCount,
					rowStartIndex: allCells.rowStartIndex + fixedRowCount,
					rowStopIndex: allCells.rowStopIndex + fixedRowCount,
				},
			);
		},
		[fixedColumnCount, fixedRowCount, onCellsRendered],
	);

	const topLeftGrid = useRef<GridImperativeAPI>(null);
	const topRightGrid = useRef<GridImperativeAPI>(null);
	const bottomLeftGrid = useRef<GridImperativeAPI>(null);
	const bottomRightGrid = useRef<GridImperativeAPI>(null);
	const handleScrollPinnedRequested = useRef<number | null>(null);
	const handleScrollRequested = useRef<number | null>(null);

	const handleScroll = useCallback((evt: React.UIEvent<HTMLDivElement>) => {
		if (handleScrollRequested.current != null) return;
		if (handleScrollPinnedRequested.current)
			window.clearTimeout(handleScrollPinnedRequested.current);
		handleScrollPinnedRequested.current = window.setTimeout(() => {
			handleScrollPinnedRequested.current = null;
		}, SCROLL_DETECTION_DELAY_MS);
		topRightGrid.current?.element?.scrollTo({
			left: evt.currentTarget.scrollLeft,
		});
		bottomLeftGrid.current?.element?.scrollTo({
			top: evt.currentTarget.scrollTop,
		});
	}, []);

	const handleScrollPinned = useCallback(
		(evt: React.UIEvent<HTMLDivElement>) => {
			if (handleScrollPinnedRequested.current != null) return;
			if (handleScrollRequested.current)
				window.clearTimeout(handleScrollRequested.current);
			handleScrollRequested.current = window.setTimeout(() => {
				handleScrollRequested.current = null;
			}, SCROLL_DETECTION_DELAY_MS);
			topLeftGrid.current?.element?.scrollTo({
				left: evt.currentTarget.scrollLeft,
			});
			bottomRightGrid.current?.element?.scrollTo({
				top: evt.currentTarget.scrollTop,
			});
		},
		[],
	);

	// The user cannot scroll the header pane while there are data rows
	// (overflow: hidden), but the browser scrolls it to reveal an element
	// focused in it, e.g. a column's filter button: the body follows.
	const handleScrollHeader = useCallback(
		(evt: React.UIEvent<HTMLDivElement>) => {
			if (handleScrollPinnedRequested.current != null) return;
			if (handleScrollRequested.current)
				window.clearTimeout(handleScrollRequested.current);
			handleScrollRequested.current = window.setTimeout(() => {
				handleScrollRequested.current = null;
			}, SCROLL_DETECTION_DELAY_MS);
			bottomRightGrid.current?.element?.scrollTo({
				left: evt.currentTarget.scrollLeft,
			});
		},
		[],
	);

	// page up/down scrolls the grid from anywhere on the page, for the routes
	// where the grid *is* the page and there is nothing else to page
	useEffect(() => {
		if (!globalScrollListener) return;
		const handleKeyPress = (evt: KeyboardEvent) => {
			if (!["PageDown", "PageUp"].includes(evt.key)) return;
			evt.preventDefault();
			const rightGrid = bottomRightGrid.current;
			const leftGrid = bottomLeftGrid.current;
			if (!rightGrid || !leftGrid) return;
			const scrollStep = rightGrid.element?.clientHeight ?? 0;
			const scrollCurrent = rightGrid.element?.scrollTop ?? 0;
			if (evt.key === "PageDown") {
				rightGrid.element?.scrollTo({
					top: scrollCurrent + scrollStep,
				});
			} else if (evt.key === "PageUp") {
				rightGrid.element?.scrollTo({
					top: scrollCurrent - scrollStep,
				});
			}
		};
		document.addEventListener("keydown", handleKeyPress);
		return () => document.removeEventListener("keydown", handleKeyPress);
	}, [globalScrollListener]);

	// restore horizontal scroll when bottom grid is enabled again
	const bottomRightRendered = rowCount - fixedRowCount > 0;
	const [triggerScrollSync, setTriggerScrollSync] = useState(false);
	useLayoutEffect(() => {
		if (!bottomRightRendered) return;
		setTriggerScrollSync(true);
	}, [bottomRightRendered]);
	useLayoutEffect(() => {
		if (!triggerScrollSync) return;
		const bottomGrid = bottomRightGrid.current?.element;
		const topGrid = topRightGrid.current?.element;
		if (!bottomGrid || !topGrid) return;
		bottomGrid.scrollLeft = topGrid.scrollLeft;
		setTriggerScrollSync(false);
	}, [triggerScrollSync]);

	// The header pane and the pinned column show no scrollbars, so they leave
	// out the room the body pane's scrollbars take (none with overlay
	// scrollbars, or while the body has nothing to scroll). All three then have
	// the same viewport and scroll range, and the header and the pinned column
	// follow the body to its last position.
	const [bodyPane, setBodyPane] = useState<HTMLDivElement | null>(null);
	const handleBottomRightGridRef = useCallback(
		(grid: GridImperativeAPI | null) => {
			bottomRightGrid.current = grid;
			// react-window's element is null in its first render. The element of
			// an unmounted pane stays here until the next pane's arrives.
			if (grid?.element) setBodyPane(grid.element);
		},
		[],
	);
	const [bodyScrollbars, setBodyScrollbars] = useState(NO_SCROLLBARS);
	useLayoutEffect(() => {
		if (!bottomRightRendered || !bodyPane?.isConnected) {
			setBodyScrollbars(NO_SCROLLBARS);
			return;
		}
		const measure = () => {
			const vertical = bodyPane.offsetWidth - bodyPane.clientWidth;
			const horizontal = bodyPane.offsetHeight - bodyPane.clientHeight;
			setBodyScrollbars((prev) =>
				prev.vertical === vertical && prev.horizontal === horizontal
					? prev
					: { vertical, horizontal },
			);
		};
		measure();
		// a scrollbar that comes or goes resizes the pane's content box, which
		// the observer reports like any other resize
		const Observer = bodyPane.ownerDocument.defaultView?.ResizeObserver;
		if (!Observer) return;
		const observer = new Observer(measure);
		observer.observe(bodyPane);
		return () => observer.disconnect();
	}, [bodyPane, bottomRightRendered]);

	// the boxes of the two panes that can be the tab stop; the focus ring
	// covers the one that is
	const topRightBox = {
		top: 0,
		left: fixedWidth,
		width: Math.max(width - fixedWidth - bodyScrollbars.vertical, 0),
		height: fixedHeight,
	};
	const bottomRightBox = {
		top: fixedHeight,
		left: fixedWidth,
		width: Math.max(width - fixedWidth, 0),
		height: height - fixedHeight,
	};

	return (
		<Root style={{ width, height }}>
			{/* top left */}
			<VGrid
				gridRef={topLeftGrid}
				columnWidth={(index) => columnWidth(index)}
				rowHeight={(index) => rowHeight(index)}
				columnCount={fixedColumnCount}
				rowCount={fixedRowCount}
				style={{
					...styleTopLeftGrid,
					position: "absolute",
					top: 0,
					left: 0,
					width: Math.min(fixedWidth, width),
					height: fixedHeight,
				}}
				cellComponent={CellRendererTopLeft}
				cellProps={{}}
			/>
			{/* top right */}
			<TopRightVariableSizeGrid
				gridRef={topRightGrid}
				columnWidth={(index) => columnWidth(index + fixedColumnCount)}
				rowHeight={(index) => rowHeight(index)}
				columnCount={columnCount - fixedColumnCount}
				rowCount={fixedRowCount}
				// without rows the bottom right pane doesn't exist and this one
				// takes over as the horizontal scroller, so it's the tab stop then
				tabIndex={bottomRightRendered ? undefined : 0}
				className={bottomRightRendered ? undefined : TAB_STOP_CLASS}
				aria-label={bottomRightRendered ? undefined : label}
				onScroll={handleScrollHeader}
				style={{
					...styleTopRightGrid,
					// while there are data rows the body is the horizontal scroller
					// and the header follows it
					overflowX: bottomRightRendered ? "hidden" : "auto",
					overflowY: "hidden",
					position: "absolute",
					...topRightBox,
				}}
				cellComponent={CellRendererTopRight}
				cellProps={{}}
			/>
			{/* bottom left */}
			<BottomLeftVariableSizeGrid
				gridRef={bottomLeftGrid}
				columnWidth={(index) => columnWidth(index)}
				rowHeight={(index) => rowHeight(index + fixedRowCount)}
				columnCount={fixedColumnCount}
				rowCount={rowCount - fixedRowCount}
				onScroll={handleScrollPinned}
				style={{
					...styleBottomLeftGrid,
					position: "absolute",
					overflow: "scroll",
					top: fixedHeight,
					left: 0,
					width: Math.min(fixedWidth, width),
					height: Math.max(height - fixedHeight - bodyScrollbars.horizontal, 0),
				}}
				cellComponent={CellRendererBottomLeft}
				cellProps={{}}
			/>
			{/* bottom right */}
			{bottomRightRendered ? (
				<BottomRightVariableSizeGrid
					gridRef={handleBottomRightGridRef}
					columnWidth={(index) => columnWidth(index + fixedColumnCount)}
					rowHeight={(index) => rowHeight(index + fixedRowCount)}
					columnCount={columnCount - fixedColumnCount}
					rowCount={rowCount - fixedRowCount}
					onScroll={handleScroll}
					// the pane that actually scrolls in both directions: making it a
					// tab stop is what gives the grid a keyboard scrolling path, and
					// its onScroll keeps the two pinned panes in sync
					tabIndex={0}
					className={TAB_STOP_CLASS}
					aria-label={label}
					style={{
						...styleBottomRightGrid,
						overflowX: "auto",
						overflowY: "auto",
						position: "absolute",
						...bottomRightBox,
					}}
					onCellsRendered={onCellsRendered ? handleCellsRendered : undefined}
					cellComponent={CellRendererBottomRight}
					cellProps={{}}
				/>
			) : (
				<div
					style={{
						...styleBottomRightGrid,
						position: "absolute",
						top: fixedHeight,
						left: fixedWidth,
						width: width - fixedWidth,
						height: height - fixedHeight,
					}}
				>
					<NoContentRenderer />
				</div>
			)}
			{/* last, so it is painted above the panes and follows the tab stop */}
			<FocusRing style={bottomRightRendered ? bottomRightBox : topRightBox} />
		</Root>
	);
};

export default React.memo(MultiGrid);
