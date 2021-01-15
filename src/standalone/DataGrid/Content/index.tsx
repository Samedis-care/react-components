import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	IDataGridColumnProps,
	useDataGridColumnsWidthState,
	useDataGridState,
} from "../index";
import { AutoSizer, MultiGrid, SectionRenderedParams } from "react-virtualized";
import Cell from "./Cell";

export interface IDataGridContentProps extends IDataGridColumnProps {
	rowsPerPage: number;
}

const Content = (props: IDataGridContentProps) => {
	const { rowsPerPage } = props;
	const [state, setState] = useDataGridState();
	const columnWidth = useDataGridColumnsWidthState()[0];
	const hoverState = useState<number | null>(null);
	const dataViewRef = useRef<MultiGrid>(null);
	const { pages } = state;

	const onSectionRendered = useCallback(
		(props: SectionRenderedParams) => {
			const pageStart = (props.rowStartIndex / rowsPerPage) | 0;
			const pageEnd = (props.rowStopIndex / rowsPerPage) | 0;
			if (pageStart !== pages[0] || pageEnd !== pages[1]) {
				setState((prevState) => ({
					...prevState,
					pages: [pageStart, pageEnd],
				}));
			}
		},
		[rowsPerPage, setState, pages]
	);

	useEffect(() => {
		if (!dataViewRef.current) return;
		dataViewRef.current.recomputeGridSize();
	}, [columnWidth]);

	return (
		<AutoSizer>
			{({ width, height }) => (
				<MultiGrid
					ref={dataViewRef}
					columnCount={props.columns.length}
					columnWidth={({ index }) =>
						index === 0 ? 57 : columnWidth[props.columns[index - 1].field]
					}
					rowCount={state.rowsFiltered ?? state.rowsTotal}
					rowHeight={({ index }) => (index === 0 ? 24 : 57)}
					width={width}
					height={height}
					cellRenderer={(gridProps) => (
						<Cell
							columns={props.columns}
							hoverState={hoverState}
							{...gridProps}
						/>
					)}
					enableFixedColumnScroll
					enableFixedRowScroll
					fixedColumnCount={
						props.columns.filter((col) => col.isLocked).length + 1
					}
					fixedRowCount={1}
					hideTopRightGridScrollbar
					hideBottomLeftGridScrollbar
					styleBottomRightGrid={{ outline: "none" }}
					onSectionRendered={onSectionRendered}
				/>
			)}
		</AutoSizer>
	);
};

export default React.memo(Content);
