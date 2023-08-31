import React from "react";
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
const SelectRow = (props) => {
    const { record } = props;
    const [state] = useDataGridState();
    const { isSelected: isSelectedHook, canSelectRow, customSelectionControl, } = useDataGridProps();
    const SelectRowControl = customSelectionControl || SelectRowView;
    return (React.createElement(SelectRowControl, { checked: isSelected(state.selectAll, state.selectedRows, record, isSelectedHook), disabled: canSelectRow ? !canSelectRow(record) : false, id: record.id }));
};
export default React.memo(SelectRow);
