import React from "react";
import { MatrixTileItem as MatrixTileItemData } from "./types";
export declare const MatrixTileItemRoot: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
export declare const MatrixTileItemContent: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
/**
 * Font size for a short code: the shorter it is, the bigger it can be. Only a
 * plain string or a number can be measured this way — a number counts as the
 * digits React writes for it, so 1234 is sized like "1234". Any other
 * ReactNode keeps the default. Where the entry has less room than that size
 * needs, it draws its content smaller still (useMatrixTileFit).
 * @param label The label to size
 * @returns The font size in px: 14 up to two characters, 12 for three, 10
 * for more
 */
export declare const labelFontSize: (label: React.ReactNode) => number;
export interface MatrixTileItemProps {
    /**
     * The entry to draw
     */
    item: MatrixTileItemData;
    /**
     * The entry is one of a split pair stacked one above the other
     * (MatrixCellTileProps.splitDirection "column"): half the row high, too
     * low for the vertical flow, so the secondary label goes beside the label
     */
    stacked?: boolean;
}
declare const _default: React.MemoExoticComponent<(props: MatrixTileItemProps) => React.JSX.Element>;
export default _default;
