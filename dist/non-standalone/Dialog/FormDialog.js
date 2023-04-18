import React from "react";
import { useDialogContext } from "../../framework";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, } from "@mui/material";
var FormDialogRaw = function (props) {
    var _a = useDialogContext(), popDialog = _a[1];
    var onClose = props.onClose;
    var removeDialog = React.useCallback(function () {
        popDialog();
        if (onClose)
            onClose();
    }, [popDialog, onClose]);
    return (React.createElement(Dialog, { open: true, onClose: removeDialog },
        React.createElement(DialogTitle, null, props.title),
        React.createElement(DialogContent, null,
            React.createElement(DialogContentText, null, props.message),
            React.createElement(React.Fragment, null, props.inputs)),
        React.createElement(DialogActions, null, props.buttons.map(function (btn, index) { return (React.createElement(Button, { key: index, onClick: function () {
                popDialog();
                if (btn.onClick)
                    btn.onClick();
            }, color: "primary", autoFocus: btn.autoFocus }, btn.text)); }))));
};
export var FormDialog = React.memo(FormDialogRaw);
