import React from "react";
import { MatrixRow } from "./types";
export declare const MatrixRowHeaderRoot: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
export interface MatrixRowHeaderProps<TCell> {
    /**
     * The row this header stands for
     */
    row: MatrixRow<TCell>;
}
/**
 * The sticky first cell of a data row, with what renderRowHeader renders.
 *
 * In touch mode with onRowHeaderActions set, the whole cell is one button:
 * named by the row's label (by what the header renders without one), and
 * described by what it does and then by what the header renders, so a label
 * does not hide the rest of the header from assistive technology.
 * @remarks Memoized on the row object.
 */
declare const MatrixRowHeader: <TCell>(props: MatrixRowHeaderProps<TCell>) => React.JSX.Element;
declare const _default: typeof MatrixRowHeader;
export default _default;
