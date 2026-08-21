import React from "react";
import { MatrixExtraRow } from "./types";
export declare const MatrixExtraRowHeaderRoot: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
export interface MatrixExtraRowHeaderProps {
    /**
     * The aggregate row this header stands for
     */
    extraRow: MatrixExtraRow;
}
declare const _default: React.MemoExoticComponent<(props: MatrixExtraRowHeaderProps) => React.JSX.Element>;
export default _default;
