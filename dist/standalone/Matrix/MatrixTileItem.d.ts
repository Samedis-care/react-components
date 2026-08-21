import React from "react";
import { MatrixTileItem as MatrixTileItemData } from "./types";
export declare const MatrixTileItemRoot: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
export declare const MatrixTileItemContent: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
/**
 * Font size for a short code: the shorter it is, the bigger it can be. Only a
 * plain string can be measured this way — a ReactNode label keeps the default.
 */
export declare const labelFontSize: (label: React.ReactNode) => number;
export interface MatrixTileItemProps {
    /**
     * The entry to draw
     */
    item: MatrixTileItemData;
}
declare const _default: React.MemoExoticComponent<(props: MatrixTileItemProps) => React.JSX.Element>;
export default _default;
