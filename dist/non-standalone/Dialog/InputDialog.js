import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs(Dialog, { open: true, onClose: removeDialog, children: [_jsx(DialogTitle, { children: props.title }), _jsxs(DialogContent, { children: [_jsx(DialogContentText, { children: props.message }), _jsx(TextField, { autoFocus: true, margin: "dense", label: props.textFieldLabel, placeholder: props.textFieldPlaceholder, type: "text", value: value, onChange: updateValue, error: !valid, fullWidth: true })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleNo, color: "primary", children: props.textButtonNo }), _jsx(Button, { onClick: handleYes, color: "primary", children: props.textButtonYes })] })] }));
};
export const InputDialog = React.memo(InputDialogRaw);
