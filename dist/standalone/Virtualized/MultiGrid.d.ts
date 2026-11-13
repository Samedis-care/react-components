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
export type MultiGridClassKey = "root" | "topRightGrid" | "bottomLeftGrid" | "bottomRightGrid";
declare const _default: React.MemoExoticComponent<(inProps: MultiGridProps) => React.JSX.Element>;
export default _default;
