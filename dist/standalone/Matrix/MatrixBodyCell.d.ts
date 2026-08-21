import React from "react";
import { MatrixColumn, MatrixRow } from "./types";
export declare const MatrixBodyCellRoot: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
/**
 * The hover hint on a cell that can start a range: a dashed box saying what a
 * click would do.
 */
export declare const MatrixAddHint: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
/**
 * The add affordance on a cell that is selectable but not blank.
 *
 * A cell whose contents already cover it cannot be pressed to start a range —
 * an entry swallows the press — so this is a button of its own rather than a
 * transparent hint. It is a chip in the corner, and not a band across the cell,
 * because what is drawn and what is clickable have to be the same thing: a
 * strip that overlays the entries either steals their clicks or, if it is thin
 * enough not to, is too thin to hit.
 */
export declare const MatrixAddChip: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
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
