import React from "react";
import { MatrixCellTileProps } from "./MatrixCellTileContext";
export declare const MatrixCellTileRoot: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
/**
 * The attention ring around a highlighted entry.
 * @remarks A STATIC ring on purpose: an infinite CSS animation keeps the
 * compositor awake and drains battery on tablets as long as the grid is open.
 * A solid ring highlights just as clearly at zero cost.
 */
export declare const MatrixTileHighlight: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
export declare const MatrixTilePlaceholder: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
declare const _default: React.MemoExoticComponent<(inProps: MatrixCellTileProps) => React.JSX.Element>;
export default _default;
