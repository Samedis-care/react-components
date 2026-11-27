import React, { useCallback, useMemo, useSyncExternalStore } from "react";
import { alpha, styled, Tooltip } from "@mui/material";
import { Add } from "@mui/icons-material";
import combineClassNames from "../../utils/combineClassNames";
import {
	columnVariantClass,
	cssVar,
	matrixClasses,
	matrixVars,
} from "./matrixClasses";
import { cellBorders, columnTintStyles } from "./matrixTints";
import {
	isCellSelectableIn,
	ownEntryOf,
	useMatrixConfig,
} from "./MatrixGridContext";
import useMatrixActivation from "./useMatrixActivation";
import {
	MATRIX_CELL_ADD_HINT,
	MATRIX_CELL_SELECTED,
	useMatrixInteraction,
} from "./MatrixInteractionContext";
import { columnNameOf, isNamePart } from "./matrixNames";
import { MatrixCellContext, MatrixColumn, MatrixRow } from "./types";
import visuallyHidden from "../../utils/internal/visuallyHidden";

export const MatrixBodyCellRoot = styled("div", {
	name: "CcMatrixGrid",
	slot: "cell",
})(({ theme }) => ({
	position: "relative",
	// its own stacking context, so the add hint's z-index cannot reach past the
	// cell and paint over the sticky headers
	zIndex: 0,
	// The chip is in the DOM whenever a range may start on this cell — that is
	// what makes it reachable by Tab — and only visible once the cell is hovered
	// or holds the focus. opacity, not visibility or a mount: a hidden-by-
	// opacity element still takes focus, and focusing it turns it visible.
	"& [data-cc-matrix-add-chip]": { opacity: 0, pointerEvents: "none" },
	"&:hover [data-cc-matrix-add-chip], &:focus-within [data-cc-matrix-add-chip]":
		{ opacity: 1, pointerEvents: "auto" },
	// nothing hovers on a touch device, so there the chip is simply there
	[`& [data-cc-matrix-add-chip].${matrixClasses.touch}`]: {
		opacity: 1,
		pointerEvents: "auto",
	},
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
 * click would do. Escape hides it until the pointer moves to another cell.
 *
 * It shows addLabel (MatrixAddHintLabel) where the label fits on one line, and
 * a "+" (MatrixAddHintIcon) in its place where it does not. Layout decides,
 * nothing is measured: the label and the "+" are the items of a wrapping flex
 * line, and the hint shows only its last line. A label that fits shares the
 * line with the "+", which has no width there; a longer one is left alone on
 * a line above, hidden, and the "+" takes the whole last line. The label stays
 * in the hint either way, so it remains the hint's text.
 */
export const MatrixAddHint = styled("div", {
	name: "CcMatrixGrid",
	slot: "addHint",
})(({ theme }) => {
	const tint = alpha(
		theme.palette.success.main,
		theme.palette.mode === "dark" ? 0.2 : 0.12,
	);
	return {
		position: "absolute",
		zIndex: 3,
		inset: 5,
		pointerEvents: "none",
		display: "flex",
		flexWrap: "wrap",
		// the last line at the bottom, the hint's whole height; a line above it
		// (a label that did not fit) is clipped
		alignContent: "flex-end",
		alignItems: "center",
		// room between the dashed border and a label that only just fits
		paddingInline: 2,
		borderRadius: theme.shape.borderRadius,
		border: `2px dashed ${theme.palette.success.main}`,
		backgroundColor: tint,
		color:
			theme.palette.mode === "dark"
				? theme.palette.success.light
				: theme.palette.success.dark,
		fontSize: "0.8rem",
		fontWeight: 600,
		overflow: "hidden",
		// The cell has contents, and occupiedAddAffordance says "overlay": the
		// hint takes the lower half and CATCHES the pointer there, so a press
		// lands on it instead of on the entry underneath. One big target that
		// reads like the blank-cell hint — and while the pointer is on the cell
		// the entries' lower halves belong to it (Escape gives them back), which
		// is the trade the consumer opts into.
		[`&.${matrixClasses.addHintHalf}`]: {
			inset: "auto 5px 5px 5px",
			height: "calc(50% - 5px)",
			pointerEvents: "auto",
			cursor: "pointer",
			// Opaque: the same tint over the grid's background, not over the
			// entries, whose fills would show through and take the text below
			// 4.5:1.
			backgroundColor: theme.palette.background.paper,
			backgroundImage: `linear-gradient(${tint}, ${tint})`,
		},
	};
});

/**
 * The text of the add hint (addLabel), on one line. It takes all the room its
 * line has and centers itself in it, so the "+" next to it gets none, and it
 * never shrinks: a label wider than the hint does not fit next to the "+", and
 * leaves the "+" a line of its own (see MatrixAddHint).
 */
export const MatrixAddHintLabel = styled("span", {
	name: "CcMatrixGrid",
	slot: "addHintLabel",
})({
	// any share of the free space the "+" got would show it beside the label
	flex: "1000000 0 auto",
	whiteSpace: "nowrap",
	textAlign: "center",
});

/**
 * The "+" of the add hint, shown where addLabel does not fit (see
 * MatrixAddHint). Of no width of its own: beside a label that fits it gets no
 * room and is not seen; alone on the hint's last line it takes all of it, the
 * glyph in the middle.
 *
 * Its tooltip is addLabel, so it catches the pointer even in the blank-cell
 * hint, which lets presses through to the cell: a press on it still reaches
 * the cell and starts a range there, as one on the hint does.
 */
export const MatrixAddHintIcon = styled("span", {
	name: "CcMatrixGrid",
	slot: "addHintIcon",
})({
	flex: "1 0 0",
	minWidth: 0,
	height: "100%",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	overflow: "hidden",
	pointerEvents: "auto",
	// the overlay hint of a low row is lower than the glyph: smaller, not cut
	"& .MuiSvgIcon-root": { maxHeight: "100%" },
});

/**
 * The add affordance on a cell that is selectable but not blank.
 *
 * A cell whose contents already cover it cannot be pressed to start a range —
 * an entry swallows the press — so this is a button of its own rather than a
 * transparent hint. It is a chip in the corner, and not a band across the cell,
 * because what is drawn and what is clickable have to be the same thing: a
 * strip that overlays the entries either steals their clicks or, if it is thin
 * enough not to, is too thin to hit. It is 24x24px, the smallest target WCAG
 * 2.5.8 allows for a control that lies on another one.
 *
 * While it shows (the cell hovered, the chip focused, or at rest on a touch
 * device), it lies over the bottom right of the cell's last entry, that
 * entry's bottomRight corner included, and a press there adds.
 */
export const MatrixAddChip = styled("div", {
	name: "CcMatrixGrid",
	slot: "addChip",
})(({ theme }) => ({
	position: "absolute",
	zIndex: 3,
	right: 3,
	bottom: 3,
	boxSizing: "border-box",
	minWidth: 24,
	height: 24,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	borderRadius: theme.shape.borderRadius,
	border: `1px solid ${theme.palette.success.main}`,
	// success.main at rest, because contrastText is computed for exactly that:
	// filling with success.light left the "+" at ~2.5:1 until hover, below the
	// 3:1 minimum for a non-text graphic — worst at the moment it is looked for.
	backgroundColor: theme.palette.success.main,
	color: theme.palette.success.contrastText,
	cursor: "pointer",
	"&:hover": { backgroundColor: theme.palette.success.dark },
	"&:focus-visible": {
		outline: `2px solid ${theme.palette.primary.main}`,
		outlineOffset: 1,
		// the ring lies on the entry beneath the chip: a line of the grid's
		// background between the two keeps it visible on any fill
		boxShadow: `0 0 0 1px ${theme.palette.background.paper}`,
	},
}));

/**
 * The add chip's name: addLabel, the row's label and the column's name, as
 * text that is visually hidden (the chip shows only its icon). Text rather
 * than an aria-label, so that an addLabel that is a node names the chip too.
 */
export const MatrixAddChipLabel = styled("span", {
	name: "CcMatrixGrid",
	slot: "addChipLabel",
})(visuallyHidden);

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
	const {
		renderCell,
		renderCellWrapper,
		selectable,
		addLabel,
		occupiedAddAffordance,
		touch,
		classes,
	} = config;
	const store = useMatrixInteraction();
	const cell = ownEntryOf(row.cells, column.key);
	const context = useMemo<MatrixCellContext<TCell>>(
		() => ({ row, column, columnIndex }),
		[row, column, columnIndex],
	);
	// The same predicate the store clamps and paints with, so what a press can
	// start on cannot drift from what ends up in the range.
	const cellSelectable = isCellSelectableIn(config, row, column, columnIndex);
	const occupied = config.isCellOccupied(cell, context);

	const getSnapshot = useCallback(
		() => store.getCellState(row.key, column.key),
		[store, row.key, column.key],
	);
	const state = useSyncExternalStore(store.subscribe, getSnapshot);

	const handleMouseDown = useCallback(
		(event: React.MouseEvent) => {
			if (event.button !== 0) return; // right/middle click is not a range
			// Anything interactive the contents render wins: swallowing the
			// default here would kill a native drag, and take focus-on-click
			// away from a button, a link or an input inside the cell.
			if (
				event.target instanceof Element &&
				event.target.closest(
					"[draggable=true],button,a,input,select,textarea,[role=button],[contenteditable=true]",
				)
			)
				return;
			event.preventDefault(); // no text selection while sweeping
			store.begin(row.key, column.key);
		},
		[store, row.key, column.key],
	);
	const handleMouseEnter = useCallback(
		(event: React.MouseEvent) => {
			store.enter(row.key, column.key, event.buttons);
		},
		[store, row.key, column.key],
	);
	const handleMouseLeave = useCallback(() => {
		store.leave(row.key, column.key);
	}, [store, row.key, column.key]);

	const addToCell = useCallback(() => {
		store.selectSingle(row.key, column.key);
	}, [store, row.key, column.key]);
	// Both are gated on the cell actually accepting an entry: an affordance on a
	// cell where a range cannot start is a dead control (and in overlay mode a
	// press-eating one).
	//
	// On a touch device the chip is used even in overlay mode, and it is visible
	// at rest: the overlay only ever appears on hover, so on a tablet an
	// occupied cell would otherwise have no way to add at all — a press on a
	// clickable entry is the entry's, never the cell's.
	const chip =
		cellSelectable && occupied && (occupiedAddAffordance === "chip" || touch);
	const overlay =
		cellSelectable && !touch && occupiedAddAffordance === "overlay"
			? occupied
			: false;
	// named by its contents, see MatrixAddChipLabel
	const chipActivation = useMatrixActivation(chip ? addToCell : undefined);
	// The chip's name says what it does and on which cell, or every chip of the
	// grid would be the same "Add". It doubles as the tooltip where it is text.
	const chipWhere = [row.label, columnNameOf(column)]
		.filter(isNamePart)
		.join(", ");
	const chipTitle =
		(typeof addLabel === "string"
			? [addLabel, chipWhere].filter(Boolean).join(", ")
			: isNamePart(addLabel)
				? undefined // a node, not text
				: chipWhere) || undefined;
	const stopPress = useCallback((event: React.MouseEvent) => {
		// the chip reports the cell itself; letting the press through would
		// begin a range on the same cell and report it twice
		event.stopPropagation();
	}, []);

	const content = useMemo(() => {
		const node = renderCell(cell, context);
		return renderCellWrapper ? renderCellWrapper(node, context) : node;
	}, [renderCell, renderCellWrapper, cell, context]);

	return (
		<MatrixBodyCellRoot
			role={"gridcell"}
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
			{chip && (
				<MatrixAddChip
					data-cc-matrix-add-chip={""}
					className={combineClassNames([
						classes?.addChip,
						touch && matrixClasses.touch,
					])}
					title={chipTitle}
					{...chipActivation}
					onMouseDown={stopPress}
				>
					<Add fontSize={"small"} />
					<MatrixAddChipLabel className={classes?.addChipLabel}>
						{addLabel}
						{isNamePart(addLabel) && chipWhere ? ", " : null}
						{chipWhere}
					</MatrixAddChipLabel>
				</MatrixAddChip>
			)}
			{!chip && cellSelectable && !!(state & MATRIX_CELL_ADD_HINT) && (
				<MatrixAddHint
					className={combineClassNames([
						classes?.addHint,
						overlay && matrixClasses.addHintHalf,
					])}
				>
					<MatrixAddHintLabel className={classes?.addHintLabel}>
						{addLabel}
					</MatrixAddHintLabel>
					{/* As the entries' tooltips: the same delay, so a pointer
					passing over a row of free cells does not flash one in each,
					and describeChild, as a role-less element cannot carry the
					aria-label a name would be. The label is the hint's text. */}
					<Tooltip title={addLabel} enterDelay={400} describeChild>
						<MatrixAddHintIcon
							className={classes?.addHintIcon}
							aria-hidden={true}
						>
							<Add fontSize={"small"} />
						</MatrixAddHintIcon>
					</Tooltip>
				</MatrixAddHint>
			)}
		</MatrixBodyCellRoot>
	);
};

export default React.memo(MatrixBodyCell) as typeof MatrixBodyCell;
