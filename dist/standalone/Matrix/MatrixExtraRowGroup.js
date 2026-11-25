import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ccI18n from "../../i18n";
import { useMatrixConfig } from "./MatrixGridContext";
import MatrixContents from "./MatrixContents";
import MatrixExtraRowHeader from "./MatrixExtraRowHeader";
import MatrixExtraRowCell from "./MatrixExtraRowCell";
/**
 * The grid never suspended, and the one text it translates is only heard:
 * while the translations load it uses the English default, then re-renders
 */
const TRANSLATION_OPTIONS = { i18n: ccI18n, useSuspense: false };
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
    const { t } = useTranslation("translation", TRANSLATION_OPTIONS);
    const addName = t("standalone.matrix.extra-cell-add", {
        defaultValue: "Add",
    });
    const [activeKey, setActiveKey] = useState(null);
    // only true right after an arrow key, so the row does not steal the focus
    // when it renders
    const [pullFocus, setPullFocus] = useState(false);
    // The remembered cell only while its column is on screen: after the
    // columns change under it (paging to another range), the row falls back
    // to its first column rather than having no tab stop at all. The key is
    // kept, so the cell is the tab stop again if its column comes back.
    const remembered = useMemo(() => activeKey !== null && columns.some((column) => column.key === activeKey)
        ? activeKey
        : null, [activeKey, columns]);
    const active = remembered ?? columns[0]?.key;
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
    return (_jsxs(MatrixContents, { role: "row", children: [_jsx(MatrixExtraRowHeader, { extraRow: props.extraRow }), columns.map((column) => (_jsx(MatrixExtraRowCell, { extraRow: props.extraRow, column: column, tabStop: column.key === active, 
                // only the cell an arrow key moved to takes the focus, never
                // the fallback
                pullFocus: pullFocus && column.key === remembered, onNavigate: navigate, onFocusColumn: focusColumn, addName: addName }, column.key)))] }));
};
export default React.memo(MatrixExtraRowGroup);
