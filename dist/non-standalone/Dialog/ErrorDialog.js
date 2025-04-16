import React from "react";
import { useDialogContext } from "../../framework";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, } from "@mui/material";
const ErrorDialogRaw = (props) => {
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
            React.createElement(DialogContentText, { component: "span" }, props.message)),
        React.createElement(DialogActions, null, props.buttons.map((data, index) => (React.createElement(Button, { key: index, onClick: async () => {
                if (data.onClick)
                    await data.onClick(removeDialog);
                if (!data.dontClose)
                    removeDialog();
            }, color: data.color || "primary", autoFocus: data.autoFocus }, data.text))))));
};
export const ErrorDialog = React.memo(ErrorDialogRaw);
