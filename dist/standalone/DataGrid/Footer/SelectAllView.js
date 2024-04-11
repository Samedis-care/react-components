import React from "react";
import { DataGridSelectAllCheckbox, useDataGridProps } from "../DataGrid";
const SelectAllView = (props) => {
    const { classes } = useDataGridProps();
    return (React.createElement(DataGridSelectAllCheckbox, { className: classes?.selectAllCheckbox, checked: props.checked, onChange: props.onSelect, disabled: props.disabled }));
};
export default React.memo(SelectAllView);
