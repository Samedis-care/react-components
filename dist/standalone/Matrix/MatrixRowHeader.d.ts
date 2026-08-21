import React from "react";
import { MatrixRow } from "./types";
export declare const MatrixRowHeaderRoot: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
export interface MatrixRowHeaderProps<TCell> {
    /**
     * The row this header stands for
     */
    row: MatrixRow<TCell>;
}
declare const MatrixRowHeader: <TCell>(props: MatrixRowHeaderProps<TCell>) => React.JSX.Element;
declare const _default: typeof MatrixRowHeader;
export default _default;
