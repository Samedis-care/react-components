import React from "react";
import { Divider, List, ListItemSecondaryAction, ListItemText, TextField, } from "@material-ui/core";
import { SmallIconButton, SmallListItem, SmallListItemIcon, } from "../../../standalone";
import { Delete as DeleteIcon } from "@material-ui/icons";
var CustomMultiSelectEntry = function (props) {
    var enableIcons = props.enableIcons, enableDivider = props.enableDivider, handleDelete = props.handleDelete, data = props.data;
    return (React.createElement(React.Fragment, null,
        React.createElement(List, null,
            React.createElement(SmallListItem, { button: true, onClick: data.onClick },
                enableIcons && React.createElement(SmallListItemIcon, null, data.icon),
                React.createElement(ListItemText, null,
                    data.label,
                    React.createElement(TextField, { defaultValue: "sample text field" })),
                React.createElement(ListItemSecondaryAction, null,
                    React.createElement(SmallIconButton, { edge: "end", name: data.value, disabled: !handleDelete, onClick: handleDelete },
                        React.createElement(DeleteIcon, null))))),
        enableDivider && React.createElement(Divider, null)));
};
export default React.memo(CustomMultiSelectEntry);
