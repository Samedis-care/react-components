import React from "react";
import Checkbox from "../../UIKit/Checkbox";
import { useDataGridStyles } from "../DataGrid";
const SelectAllView = (props) => {
    const classes = useDataGridStyles();
    return (React.createElement(Checkbox, { className: classes.selectAllCheckbox, checked: props.checked, onChange: props.onSelect, disabled: props.disabled }));
};
export default React.memo(SelectAllView);
