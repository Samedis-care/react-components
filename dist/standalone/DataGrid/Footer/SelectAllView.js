import React from "react";
import Checkbox from "../../UIKit/Checkbox";
import { useDataGridStyles } from "../DataGrid";
var SelectAllView = function (props) {
    var classes = useDataGridStyles();
    return (React.createElement(Checkbox, { className: classes.selectAllCheckbox, checked: props.checked, onChange: props.onSelect, disabled: props.disabled }));
};
export default React.memo(SelectAllView);
