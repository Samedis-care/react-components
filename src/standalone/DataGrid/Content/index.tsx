import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
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
import { Loader } from "../../index";
import useCCTranslations from "../../../utils/useCCTranslations";
import { withStyles } from "@material-ui/core";
import CenteredTypography from "../../UIKit/CenteredTypography";

export interface IDataGridContentProps extends IDataGridColumnProps {
	rowsPerPage: number;
}

const CenteredStickyTypography = withStyles({
	outerWrapper: {
		position: "sticky",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
})(CenteredTypography);

const SELECT_ROW_WIDTH = 57;
const DEFAULT_COLUMN_WIDTH = 200;

const Content = (props: IDataGridContentProps) => {
	const {
		rowsPerPage,
		columns,
		disableSelection,
		headerHeight: headerHeightOverride,
	} = props;
	const headerHeight = headerHeightOverride ?? 32;
	const { t } = useCCTranslations();
	const [state, setState] = useDataGridState();
	const [columnWidth, setColumnWidth] = useDataGridColumnsWidthState();
	const [width, setWidth] = useState(0);
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

	const onResize = useCallback((size: Size) => {
		setWidth(size.width);
	}, []);

	const scrollbarWidth = useMemo(() => {
		const scrollDiv = document.createElement("div");
		scrollDiv.style.width = "100px";
		scrollDiv.style.height = "100px";
		scrollDiv.style.overflow = "scroll";
		scrollDiv.style.position = "absolute";
		scrollDiv.style.top = "-101px";
		document.body.appendChild(scrollDiv);
		const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
		document.body.removeChild(scrollDiv);
		return scrollbarWidth;
	}, []);

	const remainingWidth = useMemo(() => {
		const columnsToResize: IDataGridColumnDef[] = (Object.keys(columnWidth)
			.map((field) => columns.find((col) => col.field === field))
			.filter((entry) => entry) as IDataGridColumnDef[])
			.filter((entry) => !state.hiddenColumns.includes(entry.field))
			.filter((entry) => !entry.width || !entry.width[2]);
		const usedWidth =
			Object.entries(columnWidth)
				.filter(([field]) =>
					columnsToResize.find((col: IDataGridColumnDef) => col.field === field)
				)
				.reduce((a, b) => a + b[1], 0) +
			(disableSelection ? 0 : SELECT_ROW_WIDTH);
		return Math.max(width - usedWidth - scrollbarWidth, 0);
	}, [
		columnWidth,
		columns,
		disableSelection,
		state.hiddenColumns,
		width,
		scrollbarWidth,
	]);

	useEffect(() => {
		if (width <= 0) return;
		if (state.initialResize) return;
		// only run on initial resize
		setColumnWidth((prevState) => {
			// resolve all visible columns which don't have an fixed initial width
			let columnsToResize: IDataGridColumnDef[] = (Object.keys(prevState)
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
					.reduce((a, b) => a + b[1], 0) +
				(disableSelection ? 0 : SELECT_ROW_WIDTH);
			let remainingWidth = width - usedWidth - scrollbarWidth;
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
					const widthDiff = newState[col.field] + resizePerColumn - newSize;
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
		setState((prev) => ({ ...prev, initialResize: true }));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state.initialResize, width]);

	useEffect(() => {
		if (!dataViewRef.current) return;
		dataViewRef.current.recomputeGridSize();
	}, [columnWidth]);

	return (
		<AutoSizer onResize={onResize}>
			{({ width, height }) => (
				<MultiGrid
					key={
						// workaround for Uncaught Error: Requested index X is outside of range 0..0
						// bug happens when columns.length == 0, rowCount > 1 and grid reset all is used
						(state.rowsFiltered ?? state.rowsTotal) === 0 ? "loading" : "ready"
					}
					ref={dataViewRef}
					columnCount={columns.length + (disableSelection ? 0 : 1) + 1}
					columnWidth={({ index }) =>
						disableSelection
							? index !== columns.length
								? columnWidth[columns[index].field] ?? DEFAULT_COLUMN_WIDTH
								: remainingWidth
							: index === 0
							? SELECT_ROW_WIDTH
							: index !== columns.length + 1
							? columnWidth[columns[index - 1].field] ?? DEFAULT_COLUMN_WIDTH
							: remainingWidth
					}
					rowCount={(state.rowsFiltered ?? state.rowsTotal) + 1}
					rowHeight={({ index }) => (index === 0 ? headerHeight : 57)}
					width={width}
					height={height}
					cellRenderer={(gridProps) => (
						<Cell columns={columns} hoverState={hoverState} {...gridProps} />
					)}
					enableFixedColumnScroll
					enableFixedRowScroll
					fixedColumnCount={
						columns.filter((col) => col.isLocked).length +
						(disableSelection ? 0 : 1)
					}
					fixedRowCount={1}
					hideTopRightGridScrollbar
					hideBottomLeftGridScrollbar
					styleTopLeftGrid={{ overflow: "hidden" }}
					styleTopRightGrid={{
						overflow: "hidden",
						overscrollBehavior: "contain",
						display: columns.length === 0 ? "none" : undefined,
					}}
					styleBottomLeftGrid={{
						overflow: "hidden",
						display:
							(state.rowsFiltered ?? state.rowsTotal) === 0
								? "none"
								: undefined,
					}}
					styleBottomRightGrid={{ outline: "none" }}
					onSectionRendered={onSectionRendered}
					noContentRenderer={() => (
						<>
							<div
								style={{
									position: "absolute",
									width: columns
										.filter((entry) => !entry.isLocked)
										.map(
											(entry) =>
												columnWidth[entry.field] ?? DEFAULT_COLUMN_WIDTH
										)
										.reduce((prev, cur) => prev + cur, 0),
									height: 1,
								}}
							/>
							{state.refreshData ? (
								<Loader />
							) : state.dataLoadError ? (
								<CenteredStickyTypography variant={"h5"}>
									{state.dataLoadError.message}
								</CenteredStickyTypography>
							) : (
								<CenteredStickyTypography variant={"h4"}>
									{t("standalone.data-grid.content.no-data")}
								</CenteredStickyTypography>
							)}
						</>
					)}
				/>
			)}
		</AutoSizer>
	);
};

export default React.memo(Content);
