import React from "react";
import { MatrixRow } from "./types";
export interface MatrixDataRowProps<TCell> {
    /**
     * The row to render: its sticky header plus one cell per column
     */
    row: MatrixRow<TCell>;
}
/**
 * One data row of the grid.
 * @remarks Memoized on the row alone — everything else comes from the config
 * context — so a data update re-renders the rows that changed and no others.
 */
declare const MatrixDataRow: <TCell>(props: MatrixDataRowProps<TCell>) => React.JSX.Element;
declare const _default: typeof MatrixDataRow;
export default _default;
