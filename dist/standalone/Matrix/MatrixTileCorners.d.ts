import React from "react";
import { MatrixTileCorner, MatrixTileItem } from "./types";
export declare const MatrixTileCornerRoot: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
export interface MatrixTileCornersProps {
    /**
     * The entry whose corners are drawn
     */
    item: MatrixTileItem;
    /**
     * Which corners to draw
     * @default all four
     */
    only?: MatrixTileCorner[];
    /**
     * Custom class for every corner
     */
    className?: string;
}
declare const _default: React.MemoExoticComponent<(props: MatrixTileCornersProps) => React.JSX.Element | null>;
export default _default;
