import React from "react";
import { useDialogContext } from "../../framework";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, } from "@material-ui/core";
var ErrorDialogRaw = function (props) {
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
            React.createElement(DialogContentText, { component: "span" }, props.message)),
        React.createElement(DialogActions, null, props.buttons.map(function (data, index) { return (React.createElement(Button, { key: index, onClick: function () {
                if (data.onClick)
                    data.onClick();
                if (!data.dontClose)
                    removeDialog();
            }, color: data.color || "primary", autoFocus: data.autoFocus }, data.text)); }))));
};
export var ErrorDialog = React.memo(ErrorDialogRaw);
