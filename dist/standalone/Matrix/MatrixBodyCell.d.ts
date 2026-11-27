import React from "react";
import { MatrixColumn, MatrixRow } from "./types";
export declare const MatrixBodyCellRoot: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
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
export declare const MatrixAddHint: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
/**
 * The text of the add hint (addLabel), on one line. It takes all the room its
 * line has and centers itself in it, so the "+" next to it gets none, and it
 * never shrinks: a label wider than the hint does not fit next to the "+", and
 * leaves the "+" a line of its own (see MatrixAddHint).
 */
export declare const MatrixAddHintLabel: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, keyof React.ClassAttributes<HTMLSpanElement> | keyof React.HTMLAttributes<HTMLSpanElement>>, {}>;
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
export declare const MatrixAddHintIcon: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, keyof React.ClassAttributes<HTMLSpanElement> | keyof React.HTMLAttributes<HTMLSpanElement>>, {}>;
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
export declare const MatrixAddChip: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
/**
 * The add chip's name: addLabel, the row's label and the column's name, as
 * text that is visually hidden (the chip shows only its icon). Text rather
 * than an aria-label, so that an addLabel that is a node names the chip too.
 */
export declare const MatrixAddChipLabel: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, keyof React.ClassAttributes<HTMLSpanElement> | keyof React.HTMLAttributes<HTMLSpanElement>>, {}>;
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
declare const MatrixBodyCell: <TCell>(props: MatrixBodyCellProps<TCell>) => React.JSX.Element;
declare const _default: typeof MatrixBodyCell;
export default _default;
