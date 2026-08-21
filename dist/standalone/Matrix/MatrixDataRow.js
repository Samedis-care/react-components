import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { useMatrixConfig } from "./MatrixGridContext";
import MatrixRowHeader from "./MatrixRowHeader";
import MatrixBodyCell from "./MatrixBodyCell";
/**
 * One data row of the grid.
 * @remarks Memoized on the row alone — everything else comes from the config
 * context — so a data update re-renders the rows that changed and no others.
 */
const MatrixDataRow = (props) => {
    const { columns } = useMatrixConfig();
    return (_jsxs(React.Fragment, { children: [_jsx(MatrixRowHeader, { row: props.row }), columns.map((column, columnIndex) => (_jsx(MatrixBodyCell, { row: props.row, column: column, columnIndex: columnIndex }, column.key)))] }));
};
export default React.memo(MatrixDataRow);
