import React, { useCallback, useState } from "react";
import { useDialogContext } from "../../framework";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, } from "@material-ui/core";
var InputDialogRaw = function (props) {
    var _a = useDialogContext(), popDialog = _a[1];
    var onClose = props.onClose, handlerButtonNo = props.handlerButtonNo, handlerButtonYes = props.handlerButtonYes, textFieldValidator = props.textFieldValidator;
    var _b = useState(true), valid = _b[0], setValid = _b[1];
    var _c = useState(""), value = _c[0], setValue = _c[1];
    var updateValue = useCallback(function (evt) {
        setValue(evt.target.value);
        setValid(textFieldValidator(evt.target.value));
    }, [textFieldValidator]);
    var removeDialog = React.useCallback(function () {
        popDialog();
        if (onClose)
            onClose();
    }, [popDialog, onClose]);
    var handleNo = React.useCallback(function () {
        popDialog();
        handlerButtonNo();
    }, [popDialog, handlerButtonNo]);
    var handleYes = React.useCallback(function () {
        if (textFieldValidator(value)) {
            popDialog();
            handlerButtonYes(value);
        }
        else {
            setValid(false);
        }
    }, [value, handlerButtonYes, textFieldValidator, popDialog, setValid]);
    return (React.createElement(Dialog, { open: true, onClose: removeDialog },
        React.createElement(DialogTitle, null, props.title),
        React.createElement(DialogContent, null,
            React.createElement(DialogContentText, null, props.message),
            React.createElement(TextField, { autoFocus: true, margin: "dense", label: props.textFieldLabel, placeholder: props.textFieldPlaceholder, type: "text", value: value, onChange: updateValue, error: !valid, fullWidth: true })),
        React.createElement(DialogActions, null,
            React.createElement(Button, { onClick: handleNo, color: "primary" }, props.textButtonNo),
            React.createElement(Button, { onClick: handleYes, color: "primary" }, props.textButtonYes))));
};
export var InputDialog = React.memo(InputDialogRaw);
