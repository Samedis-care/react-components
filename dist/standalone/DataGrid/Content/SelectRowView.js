import React from "react";
import Checkbox from "../../UIKit/Checkbox";
import { useDataGridStyles } from "../DataGrid";
const SelectRowView = (props) => {
    const classes = useDataGridStyles();
    return (React.createElement(Checkbox, { disabled: props.disabled, checked: props.checked, className: classes.selectCheckbox }));
};
export default React.memo(SelectRowView);
