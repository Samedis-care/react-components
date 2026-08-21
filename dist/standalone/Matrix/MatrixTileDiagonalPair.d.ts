import React from "react";
import { MatrixTileItem } from "./types";
export declare const MatrixTileDiagonalRoot: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
export declare const MatrixTileDiagonalLabel: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
export interface MatrixTileDiagonalPairProps {
    /**
     * The entry drawn in the upper left half
     */
    a: MatrixTileItem;
    /**
     * The entry drawn in the lower right half
     */
    b: MatrixTileItem;
}
declare const _default: React.MemoExoticComponent<(props: MatrixTileDiagonalPairProps) => React.JSX.Element>;
export default _default;
