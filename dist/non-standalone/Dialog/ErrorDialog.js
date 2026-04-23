import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs(Dialog, { open: true, onClose: removeDialog, children: [_jsx(DialogTitle, { children: props.title }), _jsx(DialogContent, { children: _jsx(DialogContentText, { component: "span", children: props.message }) }), _jsx(DialogActions, { children: props.buttons.map((data, index) => (_jsx(Button, { onClick: async () => {
                        if (data.onClick)
                            await data.onClick(onClose);
                        if (!data.dontClose)
                            removeDialog();
                    }, color: data.color || "primary", autoFocus: data.autoFocus, children: data.text }, index))) })] }));
};
export const ErrorDialog = React.memo(ErrorDialogRaw);
