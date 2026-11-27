import React, { CSSProperties } from "react";
import { CellComponentProps, GridProps } from "react-window";
/**
 * Most props do the same as in react-virtualized MultiGrid component
 * Otherwise they are commented
 */
export interface MultiGridProps {
    width: number;
    height: number;
    columnCount: number;
    columnWidth: (column: number) => number;
    rowCount: number;
    rowHeight: (row: number) => number;
    /**
     * Called after the scrolling (bottom-right) pane rendered a different range
     * of cells, and again with the current range when this callback changes.
     * The first argument is the visible range, the second the range including
     * the overscan (3 rows and columns on each side). Both are inclusive and use
     * grid-wide indices, as `children` does: row 0 is the first pinned row and
     * column 0 the first pinned column, so `rowStartIndex >= fixedRowCount` and
     * `columnStartIndex >= fixedColumnCount`. Subtract `fixedRowCount` to get
     * the index of a data row. Only the scrolling pane reports, and it does not
     * exist while there are no data rows.
     */
    onCellsRendered?: GridProps<object>["onCellsRendered"];
    fixedColumnCount: number;
    fixedRowCount: number;
    styleTopLeftGrid: CSSProperties;
    /**
     * Extra inline style for the top-right pane: the pinned rows right of the
     * pinned columns, i.e. the header. MultiGrid sets its position, size and
     * overflow, which win over this style. While there are data rows the user
     * cannot scroll the header: it follows the body's horizontal position, and
     * when the browser scrolls it to reveal an element focused in it, the body
     * follows the header. While there are none it scrolls sideways itself and is
     * the tab stop.
     */
    styleTopRightGrid: CSSProperties;
    styleBottomLeftGrid: CSSProperties;
    styleBottomRightGrid: CSSProperties;
    /**
     * Renders one cell. It gets react-window's cell props, with grid-wide
     * `columnIndex`/`rowIndex` in every pane, and returns the cell's element.
     * Apply `style` to that element: it positions and sizes the cell.
     *
     * MultiGrid puts `ariaAttributes` (`role="gridcell"` and `aria-colindex`) on
     * the returned element unless the element sets them itself, so every row
     * has its cells for assistive technology whether or not the renderer
     * spreads them. When the returned element is one of a component of your
     * own, that component has to pass them on to its DOM element, as it does
     * `style`.
     *
     * All four panes call it as a function, so its hooks belong to the pane's
     * own cell component, which react-window memoizes.
     */
    children: (props: CellComponentProps) => React.ReactElement;
    noContentRenderer: React.ComponentType;
    /**
     * Accessible name for the scrolling pane, which is a tab stop
     * (arrow keys, page up/down and home/end scroll it once focused)
     */
    label?: string;
    /**
     * Enable global scrolling listener (enables page up/down scrolling).
     * One page is the height the scrolling pane shows.
     */
    globalScrollListener?: boolean;
}
/**
 * Theme slots of `CcMultiGrid` (`theme.components.CcMultiGrid.styleOverrides`):
 * `root`, `topRightGrid` (the pinned rows, i.e. the header), `bottomLeftGrid`
 * (the pinned columns), `bottomRightGrid` (the scrolling pane) and `focusRing`
 * (the focus ring of the pane that is the tab stop: a 2px outline in
 * `palette.primary.main` inside that pane's edges, drawn by a box over the
 * pane while the pane has keyboard focus; restyle it with e.g. `outlineColor`).
 */
export type MultiGridClassKey = "root" | "topRightGrid" | "bottomLeftGrid" | "bottomRightGrid" | "focusRing";
declare const _default: React.MemoExoticComponent<(inProps: MultiGridProps) => React.JSX.Element>;
export default _default;
