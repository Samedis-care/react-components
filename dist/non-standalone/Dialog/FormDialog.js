import React from "react";
import { useDialogContext } from "../../framework";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, } from "@mui/material";
const FormDialogRaw = (props) => {
    const [, popDialog] = useDialogContext();
    const { onClose } = props;
    const removeDialog = React.useCallback(() => {
        popDialog();
        if (onClose)
            onClose();
    }, [popDialog, onClose]);
    return (React.createElement(Dialog, { open: true, onClose: removeDialog },
        React.createElement(DialogTitle, null, props.title),
        React.createElement(DialogContent, null,
            React.createElement(DialogContentText, null, props.message),
            React.createElement(React.Fragment, null, props.inputs)),
        React.createElement(DialogActions, null, props.buttons.map((btn, index) => (React.createElement(Button, { key: index, onClick: () => {
                popDialog();
                if (btn.onClick)
                    btn.onClick();
            }, color: "primary", autoFocus: btn.autoFocus }, btn.text))))));
};
export const FormDialog = React.memo(FormDialogRaw);