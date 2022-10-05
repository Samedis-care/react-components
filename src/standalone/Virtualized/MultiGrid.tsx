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
}

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
	} = props;

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

	return (
		<div style={{ position: "relative" }}>
			{/* top left */}
			<VariableSizeGrid
				ref={topLeftGrid}
				columnWidth={(index) => columnWidth(index)}
				rowHeight={(index) => rowHeight(index)}
				columnCount={fixedColumnCount}
				rowCount={fixedRowCount}
				width={fixedWidth}
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
				width={width - fixedWidth}
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
				width={fixedWidth}
				height={height - fixedHeight}
				style={{
					...styleBottomLeftGrid,
					position: "absolute",
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
					width={width - fixedWidth}
					height={height - fixedHeight}
					onScroll={handleScroll}
					style={{
						...styleBottomRightGrid,
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