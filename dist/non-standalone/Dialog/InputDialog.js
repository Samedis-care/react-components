import React, { useCallback, useState } from "react";
import { useDialogContext } from "../../framework";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, } from "@mui/material";
const InputDialogRaw = (props) => {
    const [, popDialog] = useDialogContext();
    const { onClose, handlerButtonNo, handlerButtonYes, textFieldValidator } = props;
    const [valid, setValid] = useState(true);
    const [value, setValue] = useState("");
    const updateValue = useCallback((evt) => {
        setValue(evt.target.value);
        setValid(textFieldValidator(evt.target.value));
    }, [textFieldValidator]);
    const removeDialog = React.useCallback(() => {
        popDialog();
        if (onClose)
            onClose();
    }, [popDialog, onClose]);
    const handleNo = React.useCallback(() => {
        popDialog();
        handlerButtonNo();
    }, [popDialog, handlerButtonNo]);
    const handleYes = React.useCallback(() => {
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
export const InputDialog = React.memo(InputDialogRaw);
