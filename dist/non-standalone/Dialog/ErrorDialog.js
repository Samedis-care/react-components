import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { useDialogContext } from "../../framework";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, } from "@mui/material";
import useRefState from "../../utils/useRefState";
const ErrorDialogRaw = (props) => {
    const [, popDialog] = useDialogContext();
    const { onClose } = props;
    // pending state of an async button handler. the ref part guards against a
    // second click landing before the re-render which disables the buttons.
    const { get: getBusy, set: setBusy, state: busy, } = useRefState(false);
    const removeDialog = React.useCallback(() => {
        popDialog();
        if (onClose)
            onClose();
    }, [popDialog, onClose]);
    const handleClose = React.useCallback(() => {
        if (getBusy())
            return;
        removeDialog();
    }, [getBusy, removeDialog]);
    return (_jsxs(Dialog, { open: true, onClose: handleClose, children: [_jsx(DialogTitle, { children: props.title }), _jsx(DialogContent, { children: _jsx(DialogContentText, { component: "span", children: props.message }) }), _jsx(DialogActions, { children: props.buttons.map((data, index) => (_jsx(Button, { onClick: async () => {
                        if (getBusy())
                            return;
                        if (data.onClick) {
                            setBusy(true);
                            try {
                                await data.onClick(onClose);
                            }
                            finally {
                                setBusy(false);
                            }
                        }
                        if (!data.dontClose)
                            removeDialog();
                    }, color: data.color || "primary", autoFocus: data.autoFocus, disabled: busy, children: data.text }, index))) })] }));
};
export const ErrorDialog = React.memo(ErrorDialogRaw);
