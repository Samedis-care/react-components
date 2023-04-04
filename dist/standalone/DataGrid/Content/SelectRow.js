import React from "react";
import { useDataGridProps, useDataGridState, } from "../DataGrid";
import SelectRowView from "./SelectRowView";
var xor = function (v1, v2) {
    return v1 ? !v2 : v2;
};
var isSelectedHookDefault = function (selected) { return selected; };
export var isSelected = function (selectAll, selectedIds, record, isSelectedHook) {
    if (!record)
        return false;
    var result = xor(selectAll, selectedIds.includes(record.id));
    return (isSelectedHook !== null && isSelectedHook !== void 0 ? isSelectedHook : isSelectedHookDefault)(result, record);
};
var SelectRow = function (props) {
    var record = props.record;
    var state = useDataGridState()[0];
    var _a = useDataGridProps(), isSelectedHook = _a.isSelected, canSelectRow = _a.canSelectRow, customSelectionControl = _a.customSelectionControl;
    var SelectRowControl = customSelectionControl || SelectRowView;
    return (React.createElement(SelectRowControl, { checked: isSelected(state.selectAll, state.selectedRows, record, isSelectedHook), disabled: canSelectRow ? !canSelectRow(record) : false, id: record.id }));
};
export default React.memo(SelectRow);
