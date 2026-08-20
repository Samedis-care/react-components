import React, { useCallback, useMemo, useSyncExternalStore } from "react";
import { alpha, styled } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
import { cssVar, matrixClasses, matrixVars } from "./matrixClasses";
import { cellBorders, columnTintStyles } from "./matrixTints";
import { isCellSelectableIn, useMatrixConfig } from "./MatrixGridContext";
import {
	MATRIX_CELL_ADD_HINT,
	MATRIX_CELL_SELECTED,
	useMatrixInteraction,
} from "./MatrixInteractionContext";
import { columnVariantClass } from "./MatrixColumnHeader";
import { MatrixCellContext, MatrixColumn, MatrixRow } from "./types";

export const MatrixBodyCellRoot = styled("div", {
	name: "CcMatrixGrid",
	slot: "cell",
})(({ theme }) => ({
	position: "relative",
	// its own stacking context, so the add hint's z-index cannot reach past the
	// cell and paint over the sticky headers
	zIndex: 0,
	height: cssVar(matrixVars.rowHeight),
	...cellBorders(theme),
	...columnTintStyles(theme),
	[`&.${matrixClasses.cellSelectable}`]: {
		cursor: "pointer",
		userSelect: "none",
	},
	// after the column tints, so a selected cell wins over its column
	[`&.${matrixClasses.cellSelected}`]: {
		backgroundColor: alpha(
			theme.palette.info.main,
			theme.palette.mode === "dark" ? 0.35 : 0.25,
		),
	},
}));

/**
 * The hover hint on a cell that can start a range: a dashed box saying what a
 * click would do.
 */
export const MatrixAddHint = styled("div", {
	name: "CcMatrixGrid",
	slot: "addHint",
})(({ theme }) => ({
	position: "absolute",
	zIndex: 3,
	inset: 5,
	pointerEvents: "none",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	borderRadius: theme.shape.borderRadius,
	border: `2px dashed ${theme.palette.success.main}`,
	backgroundColor: alpha(
		theme.palette.success.main,
		theme.palette.mode === "dark" ? 0.2 : 0.12,
	),
	color:
		theme.palette.mode === "dark"
			? theme.palette.success.light
			: theme.palette.success.dark,
	fontSize: "0.8rem",
	fontWeight: 600,
	whiteSpace: "nowrap",
	overflow: "hidden",
	// The cell is not blank, it just has nothing of our own in it: claim only
	// the bottom half and CATCH the pointer there, so a press lands on the hint
	// (starting a range) while the top half still belongs to the contents.
	[`&.${matrixClasses.addHintHalf}`]: {
		inset: "auto 5px 5px 5px",
		height: "calc(50% - 5px)",
		pointerEvents: "auto",
		cursor: "pointer",
	},
}));

export interface MatrixBodyCellProps<TCell> {
	/**
	 * The row this cell belongs to
	 */
	row: MatrixRow<TCell>;
	/**
	 * The column this cell belongs to
	 */
	column: MatrixColumn;
	/**
	 * Index of the column in the columns prop
	 */
	columnIndex: number;
}

/**
 * One body cell. Everything but its own row and column comes from the grid's
 * contexts, and its pointer state comes as a bit mask from the interaction
 * store — so a sweep re-renders the handful of cells whose state changed and
 * leaves the contents of all others (and the grid itself) untouched.
 */
const MatrixBodyCell = <TCell,>(props: MatrixBodyCellProps<TCell>) => {
	const { row, column, columnIndex } = props;
	const config = useMatrixConfig<TCell>();
	const { renderCell, renderCellWrapper, selectable, addLabel, classes } =
		config;
	const store = useMatrixInteraction();
	const cell = row.cells[column.key];
	const context = useMemo<MatrixCellContext<TCell>>(
		() => ({ row, column, columnIndex }),
		[row, column, columnIndex],
	);
	// The same predicate the store clamps and paints with, so what a press can
	// start on cannot drift from what ends up in the range.
	const cellSelectable = isCellSelectableIn(config, row, column, columnIndex);
	const occupied = config.isCellOccupied(cell, context);

	const getSnapshot = useCallback(
		() => store.getCellState(row.key, columnIndex),
		[store, row.key, columnIndex],
	);
	const state = useSyncExternalStore(store.subscribe, getSnapshot);

	const handleMouseDown = useCallback(
		(event: React.MouseEvent) => {
			if (event.button !== 0) return; // right/middle click is not a range
			// A drag handle inside a selectable cell wins: swallowing the
			// default here would kill the native drag it needs.
			if (
				event.target instanceof Element &&
				event.target.closest("[draggable=true]")
			)
				return;
			event.preventDefault(); // no text selection while sweeping
			store.begin(row.key, columnIndex);
		},
		[store, row.key, columnIndex],
	);
	const handleMouseEnter = useCallback(() => {
		store.enter(row.key, columnIndex);
	}, [store, row.key, columnIndex]);
	const handleMouseLeave = useCallback(() => {
		store.leave(row.key, columnIndex);
	}, [store, row.key, columnIndex]);

	const content = useMemo(() => {
		const node = renderCell(cell, context);
		return renderCellWrapper ? renderCellWrapper(node, context) : node;
	}, [renderCell, renderCellWrapper, cell, context]);

	return (
		<MatrixBodyCellRoot
			className={combineClassNames([
				classes?.cell,
				columnVariantClass(column.variant),
				cellSelectable && matrixClasses.cellSelectable,
				!!(state & MATRIX_CELL_SELECTED) && matrixClasses.cellSelected,
			])}
			onMouseDown={cellSelectable ? handleMouseDown : undefined}
			// A range can only START on a selectable cell, but it has to hear
			// about every cell the pointer reaches: a fast drag skips cells
			// (pointer events are sampled), and the store resolves the range
			// from the anchor to wherever the pointer is now.
			onMouseEnter={selectable ? handleMouseEnter : undefined}
			onMouseLeave={selectable ? handleMouseLeave : undefined}
		>
			{content}
			{!!(state & MATRIX_CELL_ADD_HINT) && (
				<MatrixAddHint
					className={combineClassNames([
						classes?.addHint,
						occupied && matrixClasses.addHintHalf,
					])}
				>
					{addLabel}
				</MatrixAddHint>
			)}
		</MatrixBodyCellRoot>
	);
};

export default React.memo(MatrixBodyCell) as typeof MatrixBodyCell;
