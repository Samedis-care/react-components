import { jsx as _jsx } from "react/jsx-runtime";
import React, { useMemo } from "react";
import { useDataGridProps, useDataGridState, } from "../DataGrid";
import SelectRowView from "./SelectRowView";
const xor = (v1, v2) => {
    return v1 ? !v2 : v2;
};
const isSelectedHookDefault = (selected) => selected;
export const isSelected = (selectAll, selectedIds, record, isSelectedHook) => {
    if (!record)
        return false;
    const result = xor(selectAll, selectedIds.includes(record.id));
    return (isSelectedHook ?? isSelectedHookDefault)(result, record);
};
/** The text in a React node: its strings and numbers, children included */
const textOfNode = (node) => {
    if (typeof node === "string")
        return node;
    if (typeof node === "number")
        return String(node);
    if (Array.isArray(node))
        return node.map(textOfNode).join("");
    if (React.isValidElement(node))
        return textOfNode(node.props.children);
    return "";
};
/** The text a cell shows for a row's value (see Cell) */
const textOfValue = (value) => (value &&
    typeof value === "object" &&
    !React.isValidElement(value) &&
    "toString" in value
    ? value.toString()
    : textOfNode(value))
    .replace(/\s+/g, " ")
    .trim();
const TEXT_TYPES = [
    "string",
    "localized-string",
    "combined-string",
];
/**
 * The default of DataGridProps.getRowLabel: the text of the first visible
 * column that shows text, text columns first
 */
const getRowLabelDefault = (record, columns) => {
    let fallback = "";
    for (const column of columns) {
        const text = textOfValue(record[column.field]);
        if (!text)
            continue;
        if (TEXT_TYPES.includes(column.type))
            return text;
        fallback ||= text;
    }
    return fallback;
};
const SelectRow = (props) => {
    const { record, columns } = props;
    const [state] = useDataGridState();
    const { isSelected: isSelectedHook, canSelectRow, customSelectionControl, getRowLabel, } = useDataGridProps();
    const SelectRowControl = customSelectionControl || SelectRowView;
    const rowLabel = useMemo(() => getRowLabel ? getRowLabel(record) : getRowLabelDefault(record, columns), [getRowLabel, record, columns]);
    return (_jsx(SelectRowControl, { checked: isSelected(state.selectAll, state.selectedRows, record, isSelectedHook), disabled: canSelectRow ? !canSelectRow(record) : false, id: record.id, rowLabel: rowLabel }));
};
export default React.memo(SelectRow);
