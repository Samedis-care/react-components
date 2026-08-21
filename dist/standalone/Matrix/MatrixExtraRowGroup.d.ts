import React from "react";
import { MatrixExtraRow } from "./types";
export interface MatrixExtraRowGroupProps {
    /**
     * The aggregate row to render: its sticky header plus one cell per column
     */
    extraRow: MatrixExtraRow;
}
declare const _default: React.MemoExoticComponent<(props: MatrixExtraRowGroupProps) => React.JSX.Element>;
export default _default;
