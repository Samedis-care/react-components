import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	IDataGridColumnDef,
	IDataGridColumnProps,
	useDataGridColumnsWidthState,
	useDataGridState,
} from "../DataGrid";
import { AutoSizer, Size } from "react-virtualized/dist/commonjs/AutoSizer";
import { MultiGrid } from "react-virtualized/dist/commonjs/MultiGrid";
import { SectionRenderedParams } from "react-virtualized/dist/commonjs/Grid";
import Cell from "./Cell";
import { applyColumnWidthLimits } from "./ColumnHeader";
import { CenteredTypography, Loader } from "../../index";
import ccI18n from "../../../i18n";

export interface IDataGridContentProps extends IDataGridColumnProps {
	rowsPerPage: number;
}

const SELECT_ROW_WIDTH = 57;

const Content = (props: IDataGridContentProps) => {
	const { rowsPerPage, columns } = props;
	const [state, setState] = useDataGridState();
	const [columnWidth, setColumnWidth] = useDataGridColumnsWidthState();
	const hoverState = useState<number | null>(null);
	const [, setInitialResize] = useState(false);
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

	const onResize = useCallback(
		(size: Size) => {
			const { width } = size;
			if (width > 0) {
				// only run on initial resize
				setInitialResize((initiallyResized) => {
					if (!initiallyResized) {
						setColumnWidth((prevState) => {
							// resolve all visible columns which don't have an fixed initial width
							let columnsToResize: IDataGridColumnDef[] = (Object.keys(
								prevState
							)
								.map((field) => columns.find((col) => col.field === field))
								.filter((entry) => entry) as IDataGridColumnDef[])
								.filter((entry) => !state.hiddenColumns.includes(entry.field))
								.filter((entry) => !entry.width || !entry.width[2]);
							// determine width used by visible columns
							const usedWidth =
								Object.entries(prevState)
									.filter(([field]) =>
										columnsToResize.find(
											(col: IDataGridColumnDef) => col.field === field
										)
									)
									.reduce((a, b) => a + b[1], 0) + SELECT_ROW_WIDTH;
							let remainingWidth = width - usedWidth;
							if (remainingWidth <= 0) return prevState;

							// divide width over the visible columns while honoring limits
							const newState = { ...prevState };
							while (remainingWidth > 0) {
								const resizePerColumn = remainingWidth / columns.length;
								let newRemainingWidth = 0;
								columnsToResize.forEach((col) => {
									if (!(col.field in newState)) return;
									const newSize = applyColumnWidthLimits(
										col,
										newState[col.field] + resizePerColumn
									);
									const widthDiff =
										newState[col.field] + resizePerColumn - newSize;
									if (widthDiff !== 0) {
										// remove the current column from the resizable list if we hit max-width
										columnsToResize = columnsToResize.filter(
											(altcol) => altcol.field !== col.field
										);
									}
									newRemainingWidth += widthDiff;
									newState[col.field] = newSize;
								});
								remainingWidth = newRemainingWidth;
							}
							return newState;
						});
					}
					return true;
				});
			}
		},
		[columns, setColumnWidth, state.hiddenColumns]
	);

	useEffect(() => {
		if (!dataViewRef.current) return;
		dataViewRef.current.recomputeGridSize();
	}, [columnWidth]);

	return (
		<AutoSizer onResize={onResize}>
			{({ width, height }) => (
				<MultiGrid
					ref={dataViewRef}
					columnCount={columns.length + 1}
					columnWidth={({ index }) =>
						index === 0
							? SELECT_ROW_WIDTH
							: columnWidth[columns[index - 1].field] ?? 200
					}
					rowCount={(state.rowsFiltered ?? state.rowsTotal) + 1}
					rowHeight={({ index }) => (index === 0 ? 32 : 57)}
					width={width}
					height={height}
					cellRenderer={(gridProps) => (
						<Cell columns={columns} hoverState={hoverState} {...gridProps} />
					)}
					enableFixedColumnScroll
					enableFixedRowScroll
					fixedColumnCount={columns.filter((col) => col.isLocked).length + 1}
					fixedRowCount={1}
					hideTopRightGridScrollbar
					hideBottomLeftGridScrollbar
					styleTopLeftGrid={{ overflow: "hidden" }}
					styleTopRightGrid={{ overflow: "hidden" }}
					styleBottomLeftGrid={{
						overflow: "hidden",
						display:
							(state.rowsFiltered ?? state.rowsTotal) === 0
								? "none"
								: undefined,
					}}
					styleBottomRightGrid={{ outline: "none" }}
					onSectionRendered={onSectionRendered}
					noContentRenderer={() =>
						state.refreshData ? (
							<Loader />
						) : state.dataLoadError ? (
							<CenteredTypography variant={"h5"}>
								{state.dataLoadError.message}
							</CenteredTypography>
						) : (
							<CenteredTypography variant={"h4"}>
								{ccI18n.t("standalone.data-grid.content.no-data")}
							</CenteredTypography>
						)
					}
				/>
			)}
		</AutoSizer>
	);
};

export default React.memo(Content);
