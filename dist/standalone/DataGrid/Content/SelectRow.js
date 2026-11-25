import { jsx as _jsx } from "react/jsx-runtime";
import React, { useMemo } from "react";
import { useDataGridProps, useDataGridState, } from "../DataGrid";
import SelectRowView from "./SelectRowView";
import { getRowLabelDefault } from "./RowLabel";
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
    const { record, columns } = props;
    const [state] = useDataGridState();
    const { isSelected: isSelectedHook, canSelectRow, customSelectionControl, getRowLabel, } = useDataGridProps();
    const SelectRowControl = customSelectionControl || SelectRowView;
    const rowLabel = useMemo(() => getRowLabel ? getRowLabel(record) : getRowLabelDefault(record, columns), [getRowLabel, record, columns]);
    return (_jsx(SelectRowControl, { checked: isSelected(state.selectAll, state.selectedRows, record, isSelectedHook), disabled: canSelectRow ? !canSelectRow(record) : false, id: record.id, rowLabel: rowLabel }));
};
export default React.memo(SelectRow);
