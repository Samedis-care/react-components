import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs(Dialog, { open: true, onClose: removeDialog, children: [_jsx(DialogTitle, { children: props.title }), _jsxs(DialogContent, { children: [_jsx(DialogContentText, { children: props.message }), _jsx(_Fragment, { children: props.inputs })] }), _jsx(DialogActions, { children: props.buttons.map((btn, index) => (_jsx(Button, { onClick: async () => {
                        if (!btn.dontClose)
                            popDialog();
                        if (btn.onClick)
                            await btn.onClick(onClose);
                        if (!btn.dontClose && onClose)
                            onClose();
                    }, color: "primary", autoFocus: btn.autoFocus, children: btn.text }, index))) })] }));
};
export const FormDialog = React.memo(FormDialogRaw);
