import { MatrixColumnVariant } from "./types";

/**
 * State classes and CSS custom properties of the matrix components.
 *
 * The components toggle these classes instead of passing an ownerState into
 * styled(): the style functions then depend on the theme alone, so emotion
 * serializes them once per theme rather than once per cell per render, and the
 * props a memoized cell has to compare stay stable strings.
 *
 * The dynamic measurements travel the same way, as custom properties set once
 * on the grid root and read by the slot styles.
 */
export const matrixClasses = {
	/** column variant "muted" */
	columnMuted: "CcMatrixGrid-columnMuted",
	/** column variant "current" */
	columnCurrent: "CcMatrixGrid-columnCurrent",
	/** column variant "accent" */
	columnAccent: "CcMatrixGrid-columnAccent",
	/** the add hint covers the lower half of a cell that has contents */
	addHintHalf: "CcMatrixGrid-addHintHalf",
	/** cell is part of the range the pointer is sweeping */
	cellSelected: "CcMatrixGrid-cellSelected",
	/** a range may start on (or run through) this cell */
	cellSelectable: "CcMatrixGrid-cellSelectable",

	/** the row header is one tap target (touch mode) */
	rowHeaderButton: "CcMatrixGrid-rowHeaderButton",
	/** an extra row cell that reports clicks */
	extraCellClickable: "CcMatrixGrid-extraCellClickable",
	/** touch device: hints that rely on hover are shown outright */
	touch: "CcMatrixGrid-touch",
	/** tile entry rendered de-emphasized */
	itemDimmed: "CcMatrixCellTile-itemDimmed",
	/** tile entry reports clicks */
	itemClickable: "CcMatrixCellTile-itemClickable",
	/** two entries stack instead of standing side by side */
	directionColumn: "CcMatrixCellTile-directionColumn",
	/** label and secondary label sit next to each other, not above each other */
	flowHorizontal: "CcMatrixCellTile-flowHorizontal",
	/** first label of a diagonal pair (top left) */
	diagonalLabelStart: "CcMatrixCellTile-diagonalLabelStart",
	/** second label of a diagonal pair (bottom right) */
	diagonalLabelEnd: "CcMatrixCellTile-diagonalLabelEnd",
	/** a diagonal half whose entry is dimmed */
	diagonalLabelDimmed: "CcMatrixCellTile-diagonalLabelDimmed",
	cornerTopLeft: "CcMatrixCellTile-cornerTopLeft",
	cornerTopRight: "CcMatrixCellTile-cornerTopRight",
	cornerBottomLeft: "CcMatrixCellTile-cornerBottomLeft",
	cornerBottomRight: "CcMatrixCellTile-cornerBottomRight",
} as const;

export const matrixVars = {
	rowHeight: "--cc-matrix-row-height",
	headerHeight: "--cc-matrix-header-height",
	extraRowHeight: "--cc-matrix-extra-row-height",
	maxHeight: "--cc-matrix-max-height",
	tileBackground: "--cc-matrix-tile-bg",
	tileForeground: "--cc-matrix-tile-fg",
	tileBackgroundA: "--cc-matrix-tile-bg-a",
	tileBackgroundB: "--cc-matrix-tile-bg-b",
	tileForegroundA: "--cc-matrix-tile-fg-a",
	tileForegroundB: "--cc-matrix-tile-fg-b",
	tileFontSize: "--cc-matrix-tile-font-size",
	tileSecondaryFontSize: "--cc-matrix-tile-secondary-font-size",
} as const;

/** `var(--x)`, for use inside a styled() slot. */
export const cssVar = (name: string): string => `var(${name})`;

/** The state class of a column variant, or false for "normal". */
export const columnVariantClass = (
	variant: MatrixColumnVariant | undefined,
): string | false => {
	switch (variant) {
		case "muted":
			return matrixClasses.columnMuted;
		case "current":
			return matrixClasses.columnCurrent;
		case "accent":
			return matrixClasses.columnAccent;
		default:
			return false;
	}
};
