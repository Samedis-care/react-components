import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useState } from "react";
import { useMatrixConfig } from "./MatrixGridContext";
import MatrixExtraRowHeader from "./MatrixExtraRowHeader";
import MatrixExtraRowCell from "./MatrixExtraRowCell";
/**
 * One aggregate row of the grid.
 *
 * Its cells are buttons, but only ONE of them is in the tab order at a time and
 * the arrow keys move between them (the roving tabindex a grid row wants): with
 * the documented 400 column cap, a tab stop per cell would mean tabbing 400
 * times to get past one row.
 * @remarks Memoized on the row definition alone, like MatrixDataRow.
 */
const MatrixExtraRowGroup = (props) => {
    const { columns } = useMatrixConfig();
    const [activeKey, setActiveKey] = useState(null);
    // only true right after an arrow key, so the row does not steal the focus
    // when it renders
    const [pullFocus, setPullFocus] = useState(false);
    const active = activeKey ?? columns[0]?.key;
    const navigate = useCallback((from, to) => {
        const index = columns.findIndex((column) => column.key === from);
        if (index < 0)
            return;
        const next = to === "first"
            ? 0
            : to === "last"
                ? columns.length - 1
                : to === "next"
                    ? Math.min(index + 1, columns.length - 1)
                    : Math.max(index - 1, 0);
        setActiveKey(columns[next]?.key ?? null);
        setPullFocus(true);
    }, [columns]);
    const focusColumn = useCallback((columnKey) => {
        setActiveKey(columnKey);
        setPullFocus(false);
    }, []);
    return (_jsxs(React.Fragment, { children: [_jsx(MatrixExtraRowHeader, { extraRow: props.extraRow }), columns.map((column) => (_jsx(MatrixExtraRowCell, { extraRow: props.extraRow, column: column, tabStop: column.key === active, pullFocus: pullFocus && column.key === active, onNavigate: navigate, onFocusColumn: focusColumn }, column.key)))] }));
};
export default React.memo(MatrixExtraRowGroup);
