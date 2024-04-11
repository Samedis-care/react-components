import React from "react";
import { DataGridSelectCheckbox, useDataGridProps } from "../DataGrid";
const SelectRowView = (props) => {
    const { classes } = useDataGridProps();
    return (React.createElement(DataGridSelectCheckbox, { disabled: props.disabled, checked: props.checked, className: classes?.selectCheckbox }));
};
export default React.memo(SelectRowView);
