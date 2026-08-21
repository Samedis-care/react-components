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
export declare const matrixClasses: {
    /** column variant "muted" */
    readonly columnMuted: "CcMatrixGrid-columnMuted";
    /** column variant "current" */
    readonly columnCurrent: "CcMatrixGrid-columnCurrent";
    /** column variant "accent" */
    readonly columnAccent: "CcMatrixGrid-columnAccent";
    /** the add hint covers the lower half of a cell that has contents */
    readonly addHintHalf: "CcMatrixGrid-addHintHalf";
    /** cell is part of the range the pointer is sweeping */
    readonly cellSelected: "CcMatrixGrid-cellSelected";
    /** a range may start on (or run through) this cell */
    readonly cellSelectable: "CcMatrixGrid-cellSelectable";
    /** the row header is one tap target (touch mode) */
    readonly rowHeaderButton: "CcMatrixGrid-rowHeaderButton";
    /** an extra row cell that reports clicks */
    readonly extraCellClickable: "CcMatrixGrid-extraCellClickable";
    /** touch device: hints that rely on hover are shown outright */
    readonly touch: "CcMatrixGrid-touch";
    /** tile entry rendered de-emphasized */
    readonly itemDimmed: "CcMatrixCellTile-itemDimmed";
    /** tile entry reports clicks */
    readonly itemClickable: "CcMatrixCellTile-itemClickable";
    /** two entries stack instead of standing side by side */
    readonly directionColumn: "CcMatrixCellTile-directionColumn";
    /** label and secondary label sit next to each other, not above each other */
    readonly flowHorizontal: "CcMatrixCellTile-flowHorizontal";
    /** first label of a diagonal pair (top left) */
    readonly diagonalLabelStart: "CcMatrixCellTile-diagonalLabelStart";
    /** second label of a diagonal pair (bottom right) */
    readonly diagonalLabelEnd: "CcMatrixCellTile-diagonalLabelEnd";
    /** a diagonal half whose entry is dimmed */
    readonly diagonalLabelDimmed: "CcMatrixCellTile-diagonalLabelDimmed";
    readonly cornerTopLeft: "CcMatrixCellTile-cornerTopLeft";
    readonly cornerTopRight: "CcMatrixCellTile-cornerTopRight";
    readonly cornerBottomLeft: "CcMatrixCellTile-cornerBottomLeft";
    readonly cornerBottomRight: "CcMatrixCellTile-cornerBottomRight";
};
export declare const matrixVars: {
    readonly rowHeight: "--cc-matrix-row-height";
    readonly headerHeight: "--cc-matrix-header-height";
    readonly extraRowHeight: "--cc-matrix-extra-row-height";
    readonly maxHeight: "--cc-matrix-max-height";
    readonly tileBackground: "--cc-matrix-tile-bg";
    readonly tileForeground: "--cc-matrix-tile-fg";
    readonly tileBackgroundA: "--cc-matrix-tile-bg-a";
    readonly tileBackgroundB: "--cc-matrix-tile-bg-b";
    readonly tileForegroundA: "--cc-matrix-tile-fg-a";
    readonly tileForegroundB: "--cc-matrix-tile-fg-b";
    readonly tileFontSize: "--cc-matrix-tile-font-size";
    readonly tileSecondaryFontSize: "--cc-matrix-tile-secondary-font-size";
};
/** `var(--x)`, for use inside a styled() slot. */
export declare const cssVar: (name: string) => string;
/** The state class of a column variant, or false for "normal". */
export declare const columnVariantClass: (variant: MatrixColumnVariant | undefined) => string | false;
