import React from "react";
import { MatrixColumn } from "./types";
export declare const MatrixColumnHeaderRoot: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
export declare const MatrixColumnHeaderLabel: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
export declare const MatrixColumnHeaderSubLabel: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.ClassAttributes<HTMLDivElement> | keyof React.HTMLAttributes<HTMLDivElement>>, {}>;
export interface MatrixColumnHeaderProps {
    /**
     * The column this header stands for
     */
    column: MatrixColumn;
    /**
     * Ref to the header cell, set on the column the grid scrolls to
     */
    innerRef?: React.Ref<HTMLDivElement>;
}
declare const _default: React.MemoExoticComponent<(props: MatrixColumnHeaderProps) => React.JSX.Element>;
export default _default;
