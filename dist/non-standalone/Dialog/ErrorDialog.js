import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useContext, useId, useMemo } from "react";
import { PushedDialogCloseContext } from "../../framework/PushedDialogCloseContext";
import { buttonClasses, CircularProgress, DialogActions, DialogContent, DialogContentText, DialogTitle, } from "@mui/material";
import useRefState from "../../utils/useRefState";
import { dialogButtonClose } from "./dialogButtonClose";
import FocusRingButton from "../../utils/internal/FocusRingButton";
import ForcedColorsEdgeDialog from "../../utils/internal/ForcedColorsEdgeDialog";
import { useReportButtonError } from "./useReportButtonError";
// shown before the label of the button whose handler runs; the button's aria-disabled and
// the dialog's aria-busy tell assistive technology
const busyIndicator = (_jsx(CircularProgress, { color: "inherit", size: 16, "aria-hidden": true }));
const ErrorDialogRaw = (props) => {
    const { onClose } = props;
    // not useCloseThisDialog, which throws: rendered without pushDialog (or in a
    // FullFormDialog's content, pushed: false), the dialog closes through onClose
    const pushedClose = useContext(PushedDialogCloseContext);
    const closeThisDialog = pushedClose?.pushed ? pushedClose.close : null;
    // the index of the button whose async handler runs, null while none runs. the ref part
    // guards against a second click landing before the re-render which disables the buttons.
    const { get: getBusyButton, set: setBusyButton, state: busyButton, } = useRefState(null);
    const busy = busyButton !== null;
    // the message is the dialog's description
    const messageId = useId();
    const reportButtonError = useReportButtonError("ErrorDialog.onClick");
    const removeDialog = React.useCallback(() => {
        closeThisDialog?.();
        if (onClose)
            onClose();
    }, [closeThisDialog, onClose]);
    const handleClose = React.useCallback(() => {
        if (getBusyButton() !== null)
            return;
        removeDialog();
    }, [getBusyButton, removeDialog]);
    const slotProps = useMemo(() => ({ paper: { "aria-busy": busy || undefined } }), [busy]);
    return (_jsxs(ForcedColorsEdgeDialog, { open: true, onClose: handleClose, "aria-describedby": messageId, slotProps: slotProps, children: [_jsx(DialogTitle, { children: props.title }), _jsx(DialogContent, { children: _jsx(DialogContentText, { component: "span", id: messageId, children: props.message }) }), _jsx(DialogActions, { children: props.buttons.map((data, index) => (_jsx(FocusRingButton, { onClick: async () => {
                        if (getBusyButton() !== null)
                            return;
                        const { close, end } = dialogButtonClose(closeThisDialog, onClose);
                        try {
                            if (data.onClick) {
                                setBusyButton(index);
                                try {
                                    await data.onClick(close);
                                }
                                finally {
                                    setBusyButton(null);
                                }
                            }
                        }
                        catch (error) {
                            // the dialog stays open, unless the handler closed it, so the user can try
                            // again; the error shows in an error dialog over it
                            reportButtonError(error);
                            return;
                        }
                        finally {
                            // the handler closed the dialog: report it closed, also when the handler
                            // failed, as nothing can close the dialog anymore
                            end();
                        }
                        if (!data.dontClose)
                            close();
                    }, color: data.color || "primary", autoFocus: data.autoFocus, "aria-disabled": busy || undefined, className: busy ? buttonClasses.disabled : undefined, startIcon: busyButton === index ? busyIndicator : undefined, children: data.text }, index))) })] }));
};
/**
 * Message dialog with a title, a message and a row of buttons; InfoDialog and ConfirmDialog
 * render it. Show it with `pushDialog(<ErrorDialog … />)`, or use `showErrorDialog` /
 * `showInfoDialog`.
 *
 * A button runs its `onClick` while the dialog is open, then, unless `dontClose`, closes the
 * dialog and calls `onClose`. While a returned promise is awaited, the dialog is `aria-busy`,
 * its buttons are `aria-disabled` and ignore clicks, the pressed one shows a progress spinner
 * before its label, and Escape and the backdrop are ignored. The buttons stay focusable, so
 * keyboard focus stays on the pressed button. `onClick` gets a `close` that closes the dialog
 * at once; `onClose` is then called once the handler has ended, also with `dontClose`. Escape
 * and a backdrop click close it and call `onClose`.
 * If `onClick` throws or its promise rejects, the dialog stays open with its buttons enabled
 * again and `onClose` is not called (unless the handler called `close`); the error is
 * reported (captureError, source `"ErrorDialog.onClick"`) and shown in an error dialog over
 * the dialog, as showErrorDialog shows it.
 * It closes the dialog it was pushed in, and only that one, also when dialogs were pushed
 * after it. Rendered without pushDialog, it is always open: it closes through `onClose`,
 * which has to stop rendering it.
 */
export const ErrorDialog = React.memo(ErrorDialogRaw);
