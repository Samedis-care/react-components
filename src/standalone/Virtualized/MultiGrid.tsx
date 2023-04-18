import React, {
	CSSProperties,
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from "react";
import {
	GridChildComponentProps,
	GridOnItemsRenderedProps,
	GridOnScrollProps,
	VariableSizeGrid,
} from "react-window";
import makeStyles from "@mui/styles/makeStyles";

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
	onItemsRendered?: (params: GridOnItemsRenderedProps) => void;
	fixedColumnCount: number;
	fixedRowCount: number;
	styleTopLeftGrid: CSSProperties;
	styleTopRightGrid: CSSProperties;
	styleBottomLeftGrid: CSSProperties;
	styleBottomRightGrid: CSSProperties;
	children: (props: GridChildComponentProps) => React.ReactElement;
	noContentRenderer: React.ComponentType;
	/**
	 * Enable global scrolling listener (enables page up/down scrolling)
	 */
	globalScrollListener?: boolean;
}

interface ReactWindowGridState {
	scrollTop: number;
	scrollLeft: number;
}

const useStyles = makeStyles(
	{
		bottomLeft: {
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
		},
	},
	{ name: "CcMultiGrid" }
);

const MultiGrid = (props: MultiGridProps) => {
	const {
		width,
		height,
		columnCount,
		columnWidth,
		rowCount,
		rowHeight,
		onItemsRendered,
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

	const classes = useStyles();

	const fixedWidth = useMemo(
		() =>
			Array.from(new Array(fixedColumnCount).keys()).reduce(
				(p, c) => p + columnWidth(c),
				0
			),
		[columnWidth, fixedColumnCount]
	);
	const fixedHeight = useMemo(
		() =>
			Array.from(new Array(fixedRowCount).keys()).reduce(
				(p, c) => p + rowHeight(c),
				0
			),
		[fixedRowCount, rowHeight]
	);

	const CellRendererTopRight = useCallback(
		(props: GridChildComponentProps) => {
			return CellRenderer({
				...props,
				columnIndex: props.columnIndex + fixedColumnCount,
			});
		},
		[CellRenderer, fixedColumnCount]
	);
	const CellRendererBottomLeft = useCallback(
		(props: GridChildComponentProps) => {
			return CellRenderer({
				...props,
				rowIndex: props.rowIndex + fixedRowCount,
			});
		},
		[CellRenderer, fixedRowCount]
	);
	const CellRendererBottomRight = useCallback(
		(props: GridChildComponentProps) => {
			return CellRenderer({
				...props,
				columnIndex: props.columnIndex + fixedColumnCount,
				rowIndex: props.rowIndex + fixedRowCount,
			});
		},
		[CellRenderer, fixedColumnCount, fixedRowCount]
	);

	const handleItemsRendered = useCallback(
		(params: GridOnItemsRenderedProps) => {
			if (!onItemsRendered) return;
			onItemsRendered({
				...params,
				overscanColumnStartIndex:
					params.overscanColumnStartIndex + fixedColumnCount,
				overscanColumnStopIndex:
					params.overscanColumnStopIndex + fixedColumnCount,
				overscanRowStartIndex: params.overscanRowStartIndex + fixedRowCount,
				overscanRowStopIndex: params.overscanRowStopIndex + fixedRowCount,
				visibleColumnStartIndex:
					params.visibleColumnStartIndex + fixedColumnCount,
				visibleColumnStopIndex:
					params.visibleColumnStopIndex + fixedColumnCount,
				visibleRowStartIndex: params.visibleRowStartIndex + fixedRowCount,
				visibleRowStopIndex: params.visibleRowStopIndex + fixedRowCount,
			});
		},
		[fixedColumnCount, fixedRowCount, onItemsRendered]
	);

	const topLeftGrid = useRef<VariableSizeGrid>(null);
	const topRightGrid = useRef<VariableSizeGrid>(null);
	const bottomLeftGrid = useRef<VariableSizeGrid>(null);
	const bottomRightGrid = useRef<VariableSizeGrid>(null);

	const handleScroll = useCallback((evt: GridOnScrollProps) => {
		topRightGrid.current?.scrollTo({ scrollLeft: evt.scrollLeft });
		bottomLeftGrid.current?.scrollTo({ scrollTop: evt.scrollTop });
	}, []);

	const handleScrollPinned = useCallback((evt: GridOnScrollProps) => {
		topLeftGrid.current?.scrollTo({ scrollLeft: evt.scrollLeft });
		bottomRightGrid.current?.scrollTo({ scrollTop: evt.scrollTop });
	}, []);

	useEffect(() => {
		topLeftGrid.current?.resetAfterColumnIndex(0, true);
		topRightGrid.current?.resetAfterColumnIndex(0, true);
		bottomLeftGrid.current?.resetAfterColumnIndex(0, true);
		bottomRightGrid.current?.resetAfterColumnIndex(0, true);
	}, [columnWidth]);
	useEffect(() => {
		topLeftGrid.current?.resetAfterRowIndex(0, true);
		topRightGrid.current?.resetAfterRowIndex(0, true);
		bottomLeftGrid.current?.resetAfterRowIndex(0, true);
		bottomRightGrid.current?.resetAfterRowIndex(0, true);
	}, [rowHeight]);

	useEffect(() => {
		if (!globalScrollListener) return;
		const handleKeyPress = (evt: KeyboardEvent) => {
			if (!["PageDown", "PageUp"].includes(evt.key)) return;
			evt.preventDefault();
			const rightGrid = bottomRightGrid.current;
			const leftGrid = bottomLeftGrid.current;
			if (!rightGrid || !leftGrid) return;
			const scrollStep = height - fixedHeight;
			const scrollCurrent = (rightGrid.state as ReactWindowGridState).scrollTop;
			if (evt.key === "PageDown") {
				rightGrid.scrollTo({
					scrollTop: scrollCurrent + scrollStep,
				});
			} else if (evt.key === "PageUp") {
				rightGrid.scrollTo({
					scrollTop: scrollCurrent - scrollStep,
				});
			}
		};
		document.addEventListener("keydown", handleKeyPress);
		return () => document.removeEventListener("keydown", handleKeyPress);
	}, [globalScrollListener, fixedHeight, height]);

	return (
		<div style={{ position: "relative" }}>
			{/* top left */}
			<VariableSizeGrid
				ref={topLeftGrid}
				columnWidth={(index) => columnWidth(index)}
				rowHeight={(index) => rowHeight(index)}
				columnCount={fixedColumnCount}
				rowCount={fixedRowCount}
				width={Math.min(fixedWidth, width)}
				height={fixedHeight}
				style={{ ...styleTopLeftGrid, position: "absolute", top: 0, left: 0 }}
			>
				{CellRenderer}
			</VariableSizeGrid>
			{/* top right */}
			<VariableSizeGrid
				ref={topRightGrid}
				columnWidth={(index) => columnWidth(index + fixedColumnCount)}
				rowHeight={(index) => rowHeight(index)}
				columnCount={columnCount - fixedColumnCount}
				rowCount={fixedRowCount}
				width={Math.max(width - fixedWidth, 0)}
				height={fixedHeight}
				style={{
					...styleTopRightGrid,
					position: "absolute",
					top: 0,
					left: fixedWidth,
				}}
			>
				{CellRendererTopRight}
			</VariableSizeGrid>
			{/* bottom left */}
			<VariableSizeGrid
				ref={bottomLeftGrid}
				columnWidth={(index) => columnWidth(index)}
				rowHeight={(index) => rowHeight(index + fixedRowCount)}
				columnCount={fixedColumnCount}
				rowCount={rowCount - fixedRowCount}
				width={Math.min(fixedWidth, width)}
				height={height - fixedHeight}
				onScroll={handleScrollPinned}
				className={classes.bottomLeft}
				style={{
					...styleBottomLeftGrid,
					position: "absolute",
					overflow: "scroll",
					top: fixedHeight,
					left: 0,
				}}
			>
				{CellRendererBottomLeft}
			</VariableSizeGrid>
			{/* bottom right */}
			{rowCount - fixedRowCount > 0 ? (
				<VariableSizeGrid
					ref={bottomRightGrid}
					columnWidth={(index) => columnWidth(index + fixedColumnCount)}
					rowHeight={(index) => rowHeight(index + fixedRowCount)}
					columnCount={columnCount - fixedColumnCount}
					rowCount={rowCount - fixedRowCount}
					width={Math.max(width - fixedWidth, 0)}
					height={height - fixedHeight}
					onScroll={handleScroll}
					style={{
						...styleBottomRightGrid,
						overflowX: "scroll",
						overflowY: "auto",
						position: "absolute",
						top: fixedHeight,
						left: fixedWidth,
					}}
					onItemsRendered={onItemsRendered ? handleItemsRendered : undefined}
				>
					{CellRendererBottomRight}
				</VariableSizeGrid>
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
		</div>
	);
};

export default React.memo(MultiGrid);
