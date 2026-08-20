import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
} from "react";
import { styled, useThemeProps } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
import useIsTouchOnly from "../../utils/useIsTouchOnly";
import { cssVar, matrixVars } from "./matrixClasses";
import { cellBorders } from "./matrixTints";
import {
	MatrixGridProps,
	MatrixPropsContext,
	useMatrixProps,
} from "./MatrixGridContext";
import {
	MatrixInteractionContext,
	MatrixInteractionStore,
} from "./MatrixInteractionContext";
import MatrixColumnHeader from "./MatrixColumnHeader";
import MatrixRowHeader from "./MatrixRowHeader";
import MatrixBodyCell from "./MatrixBodyCell";
import MatrixExtraRowHeader from "./MatrixExtraRowHeader";
import MatrixExtraRowCell from "./MatrixExtraRowCell";
import { MatrixCellContext, MatrixExtraRow, MatrixRow } from "./types";

export type { MatrixGridProps, MatrixGridClassKey } from "./MatrixGridContext";

export const MatrixGridScroller = styled("div", {
	name: "CcMatrixGrid",
	slot: "root",
})(({ theme }) => ({
	position: "relative",
	overflow: "auto",
	maxHeight: cssVar(matrixVars.maxHeight),
	border: `1px solid ${theme.palette.divider}`,
	borderRadius: theme.shape.borderRadius,
	backgroundColor: theme.palette.background.paper,
}));

export const MatrixGridRoot = styled("div", {
	name: "CcMatrixGrid",
	slot: "grid",
})({
	display: "grid",
	width: "max-content",
});

export const MatrixCorner = styled("div", {
	name: "CcMatrixGrid",
	slot: "corner",
})(({ theme }) => ({
	position: "sticky",
	top: 0,
	left: 0,
	zIndex: 4,
	height: cssVar(matrixVars.headerHeight),
	display: "flex",
	alignItems: "center",
	padding: theme.spacing(0, 1),
	fontWeight: 700,
	fontSize: "0.75rem",
	whiteSpace: "nowrap",
	overflow: "hidden",
	textOverflow: "ellipsis",
	backgroundColor: theme.palette.background.paper,
	...cellBorders(theme),
}));

const px = (value: number | string): string =>
	typeof value === "number" ? `${value}px` : value;

/** The rows of one aggregate row: its sticky header plus one cell per column. */
const MatrixExtraRowCells = (props: {
	extraRow: MatrixExtraRow;
}): React.ReactElement => {
	const { columns } = useMatrixProps<unknown>();
	return (
		<React.Fragment>
			<MatrixExtraRowHeader extraRow={props.extraRow} />
			{columns.map((column) => (
				<MatrixExtraRowCell
					key={column.key}
					extraRow={props.extraRow}
					column={column}
				/>
			))}
		</React.Fragment>
	);
};
const MatrixExtraRowCellsMemo = React.memo(MatrixExtraRowCells);

/** One data row: its sticky header plus one cell per column. */
const MatrixDataRow = <TCell,>(props: {
	row: MatrixRow<TCell>;
	touch: boolean;
}): React.ReactElement => {
	const { columns } = useMatrixProps<TCell>();
	return (
		<React.Fragment>
			<MatrixRowHeader row={props.row} touch={props.touch} />
			{columns.map((column, columnIndex) => (
				<MatrixBodyCell
					key={column.key}
					row={props.row}
					column={column}
					columnIndex={columnIndex}
				/>
			))}
		</React.Fragment>
	);
};
const MatrixDataRowMemo = React.memo(MatrixDataRow) as typeof MatrixDataRow;

const defaultIsCellSelectable = (cell: unknown) => cell === undefined;

const MatrixGrid = <TCell,>(inProps: MatrixGridProps<TCell>) => {
	const props = useThemeProps({ props: inProps, name: "CcMatrixGrid" });
	const {
		columns,
		rows,
		corner,
		columnWidth = 46,
		rowHeight = 58,
		rowHeaderWidth = 116,
		headerHeight = 42,
		extraRowHeight = 48,
		maxHeight = "70vh",
		scrollToColumn,
		selectable,
		isCellSelectable = defaultIsCellSelectable,
		onSelectRange,
		extraRows,
		extraRowsPosition = "bottom",
		className,
		classes,
	} = props;

	// Touch-only devices (phone, tablet): there is no hover, and sweeping a
	// range fights with scrolling — the hint would flicker and read as broken.
	// A plain tap on a cell still reports a single-cell range (mousedown plus
	// mouseup on the same cell), and the row header collapses into one target.
	const touch = useIsTouchOnly();
	const localScrollRef = useRef<HTMLDivElement>(null);
	const scrollRef = props.scrollRef ?? localScrollRef;
	const scrollTargetRef = useRef<HTMLDivElement>(null);
	const store = useMemo(() => new MatrixInteractionStore(), []);

	const columnKeys = useMemo(
		() => columns.map((column) => column.key),
		[columns],
	);
	const rowsByKey = useMemo(
		() => new Map(rows.map((row) => [row.key, row])),
		[rows],
	);
	const canSelect = useCallback(
		(rowKey: string, columnIndex: number) => {
			if (!selectable) return false;
			const row = rowsByKey.get(rowKey);
			const column = columns[columnIndex];
			if (!row || !column || row.selectable === false) return false;
			const context: MatrixCellContext<TCell> = { row, column, columnIndex };
			return isCellSelectable(row.cells[column.key], context);
		},
		[selectable, rowsByKey, columns, isCellSelectable],
	);

	// The store reads the props a pointer event needs from here, so no pointer
	// state has to live in this component's state (see MatrixInteractionStore).
	// An effect is early enough: it flushes before the user can reach the grid.
	useEffect(() => {
		store.configure({ columnKeys, canSelect, touch, onSelectRange });
	}, [store, columnKeys, canSelect, touch, onSelectRange]);

	useEffect(() => {
		if (!selectable) return;
		const onUp = (event: MouseEvent) => {
			if (event.button !== 0) return;
			store.commit();
		};
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") store.cancel();
		};
		window.addEventListener("mouseup", onUp);
		window.addEventListener("keydown", onKey);
		return () => {
			window.removeEventListener("mouseup", onUp);
			window.removeEventListener("keydown", onKey);
		};
	}, [store, selectable]);

	// Scroll the marked column just past the sticky row header column. Depends
	// on `columns`, not on their count: a window that rolls forward keeps its
	// length but moves the target.
	const target =
		scrollToColumn ??
		columns.find((column) => column.variant === "current")?.key;
	useLayoutEffect(() => {
		const scroller = scrollRef.current;
		const cell = scrollTargetRef.current;
		if (scroller && cell)
			scroller.scrollLeft = Math.max(
				0,
				cell.offsetLeft - rowHeaderWidth - columnWidth,
			);
	}, [target, columns, columnWidth, rowHeaderWidth, scrollRef]);

	const rootStyle = useMemo(
		() =>
			({
				[matrixVars.columnWidth]: px(columnWidth),
				[matrixVars.rowHeight]: px(rowHeight),
				[matrixVars.rowHeaderWidth]: px(rowHeaderWidth),
				[matrixVars.headerHeight]: px(headerHeight),
				[matrixVars.extraRowHeight]: px(extraRowHeight),
				[matrixVars.maxHeight]: px(maxHeight),
			}) as React.CSSProperties,
		[
			columnWidth,
			rowHeight,
			rowHeaderWidth,
			headerHeight,
			extraRowHeight,
			maxHeight,
		],
	);
	const gridStyle = useMemo(
		() => ({
			gridTemplateColumns: `${px(rowHeaderWidth)} repeat(${columns.length}, ${px(
				columnWidth,
			)})`,
		}),
		[rowHeaderWidth, columns.length, columnWidth],
	);

	const extra = (extraRows ?? []).map((extraRow) => (
		<MatrixExtraRowCellsMemo key={extraRow.key} extraRow={extraRow} />
	));

	return (
		<MatrixPropsContext.Provider
			value={props as unknown as MatrixGridProps<unknown>}
		>
			<MatrixInteractionContext.Provider value={store}>
				<MatrixGridScroller
					ref={scrollRef}
					className={combineClassNames([className, classes?.root])}
					style={rootStyle}
				>
					<MatrixGridRoot className={classes?.grid} style={gridStyle}>
						<MatrixCorner className={classes?.corner}>{corner}</MatrixCorner>
						{columns.map((column) => (
							<MatrixColumnHeader
								key={column.key}
								column={column}
								innerRef={column.key === target ? scrollTargetRef : undefined}
							/>
						))}
						{extraRowsPosition === "top" && extra}
						{rows.map((row) => (
							<MatrixDataRowMemo key={row.key} row={row} touch={touch} />
						))}
						{extraRowsPosition === "bottom" && extra}
					</MatrixGridRoot>
				</MatrixGridScroller>
			</MatrixInteractionContext.Provider>
		</MatrixPropsContext.Provider>
	);
};

// React.memo drops the generic parameter (its typing collapses TCell to
// unknown), so the memoized component is cast back to the generic signature.
// Behaviour is unchanged, only the type survives.
export default React.memo(MatrixGrid) as typeof MatrixGrid;
