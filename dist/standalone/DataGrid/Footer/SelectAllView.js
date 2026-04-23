import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { DataGridSelectAllCheckbox, useDataGridProps } from "../DataGrid";
const SelectAllView = (props) => {
    const { classes } = useDataGridProps();
    return (_jsx(DataGridSelectAllCheckbox, { className: classes?.selectAllCheckbox, checked: props.checked, onChange: props.onSelect, disabled: props.disabled }));
};
export default React.memo(SelectAllView);
