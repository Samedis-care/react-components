import React, { CSSProperties } from "react";
import { GridChildComponentProps, GridOnItemsRenderedProps } from "react-window";
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
    onItemsRendered?: (params: GridOnItemsRenderedProps) => void;
    fixedColumnCount: number;
    fixedRowCount: number;
    styleTopLeftGrid: CSSProperties;
    styleTopRightGrid: CSSProperties;
    styleBottomLeftGrid: CSSProperties;
    styleBottomRightGrid: CSSProperties;
    children: (props: GridChildComponentProps) => React.ReactElement;
    noContentRenderer: React.ComponentType;
    /**
     * Enable global scrolling listener (enables page up/down scrolling)
     */
    globalScrollListener?: boolean;
}
declare const _default: React.MemoExoticComponent<(props: MultiGridProps) => JSX.Element>;
export default _default;
