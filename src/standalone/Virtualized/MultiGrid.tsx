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
import { styled, useThemeProps } from "@mui/material";

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
	styleTopRightGrid: CSSProperties;
	styleBottomLeftGrid: CSSProperties;
	styleBottomRightGrid: CSSProperties;
	children: (props: CellComponentProps) => React.ReactElement;
	noContentRenderer: React.ComponentType;
	/**
	 * Enable global scrolling listener (enables page up/down scrolling)
	 */
	globalScrollListener?: boolean;
}

const Root = styled("div", { name: "CcMultiGrid", slot: "root" })({
	position: "relative",
});

const BottomLeftVariableSizeGrid = styled(VGrid, {
	name: "CcMultiGrid",
	slot: "bottomLeftGrid",
})({
	// in webkit based browsers:
	// hide the vertical scrollbar, sadly also removes the default styles
	// from the horizontal scrollbar
	"&::-webkit-scrollbar": {
		width: 0,
		height: "auto",
	},
	"&::-webkit-scrollbar-track": {
		background: "white",
	},
	"&::-webkit-scrollbar-thumb": {
		background: "hsl(0, 0%, 60%)",
	},
	// in firefox just hide it completely
	// we can do that because the scrollbar
	// doesn't add to the content width in firefox
	scrollbarWidth: "none",
});

export type MultiGridClassKey = "root" | "bottomLeftGrid";

const SCROLL_DETECTION_DELAY_MS = 100; // ms to consider scroll events caused by JS code

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

	const CellRendererTopRight = useCallback(
		(props: CellComponentProps) => {
			return CellRenderer({
				...props,
				columnIndex: props.columnIndex + fixedColumnCount,
			});
		},
		[CellRenderer, fixedColumnCount],
	);
	const CellRendererBottomLeft = useCallback(
		(props: CellComponentProps) => {
			return CellRenderer({
				...props,
				rowIndex: props.rowIndex + fixedRowCount,
			});
		},
		[CellRenderer, fixedRowCount],
	);
	const CellRendererBottomRight = useCallback(
		(props: CellComponentProps) => {
			return CellRenderer({
				...props,
				columnIndex: props.columnIndex + fixedColumnCount,
				rowIndex: props.rowIndex + fixedRowCount,
			});
		},
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

	useEffect(() => {
		if (!globalScrollListener) return;
		const handleKeyPress = (evt: KeyboardEvent) => {
			if (!["PageDown", "PageUp"].includes(evt.key)) return;
			evt.preventDefault();
			const rightGrid = bottomRightGrid.current;
			const leftGrid = bottomLeftGrid.current;
			if (!rightGrid || !leftGrid) return;
			const scrollStep = height - fixedHeight;
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
	}, [globalScrollListener, fixedHeight, height]);

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
				cellComponent={CellRenderer}
				cellProps={{}}
			/>
			{/* top right */}
			<VGrid
				gridRef={topRightGrid}
				columnWidth={(index) => columnWidth(index + fixedColumnCount)}
				rowHeight={(index) => rowHeight(index)}
				columnCount={columnCount - fixedColumnCount}
				rowCount={fixedRowCount}
				style={{
					...styleTopRightGrid,
					position: "absolute",
					top: 0,
					left: fixedWidth,
					width: Math.max(width - fixedWidth, 0),
					height: fixedHeight,
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
					height: height - fixedHeight,
				}}
				cellComponent={CellRendererBottomLeft}
				cellProps={{}}
			/>
			{/* bottom right */}
			{bottomRightRendered ? (
				<VGrid
					gridRef={bottomRightGrid}
					columnWidth={(index) => columnWidth(index + fixedColumnCount)}
					rowHeight={(index) => rowHeight(index + fixedRowCount)}
					columnCount={columnCount - fixedColumnCount}
					rowCount={rowCount - fixedRowCount}
					onScroll={handleScroll}
					style={{
						...styleBottomRightGrid,
						overflowX: "scroll",
						overflowY: "auto",
						position: "absolute",
						top: fixedHeight,
						left: fixedWidth,
						width: Math.max(width - fixedWidth, 0),
						height: height - fixedHeight,
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
		</Root>
	);
};

export default React.memo(MultiGrid);
