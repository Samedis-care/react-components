import React from "react";
import { MatrixTileItem } from "./types";
/**
 * The "+N" marker: a small badge in the tile's top right corner, where the
 * topRight corner of the entry beneath it would be, so it never lies on a
 * label. Its body and its border are the grid's background and text colors:
 * whatever fill it lies on, one of the two stands out from it.
 */
export declare const MatrixTileOverflowRoot: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
export interface MatrixTileOverflowProps {
    /**
     * The entries the tile does not draw, in the order of MatrixCellTileProps.items
     */
    items: MatrixTileItem[];
}
declare const _default: React.MemoExoticComponent<(props: MatrixTileOverflowProps) => React.JSX.Element>;
export default _default;
