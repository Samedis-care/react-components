import React from "react";
import Checkbox from "../../UIKit/Checkbox";
import { useDataGridStyles } from "../DataGrid";
var SelectRowView = function (props) {
    var classes = useDataGridStyles();
    return (React.createElement(Checkbox, { disabled: props.disabled, checked: props.checked, className: classes.selectCheckbox }));
};
export default React.memo(SelectRowView);
