import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useContext, useId, useMemo } from "react";
import { PushedDialogCloseContext } from "../../framework/PushedDialogCloseContext";
import { DialogActions, DialogContent, DialogContentText, DialogTitle, buttonClasses, CircularProgress, } from "@mui/material";
import useRefState from "../../utils/useRefState";
import { dialogButtonClose } from "./dialogButtonClose";
import FocusRingButton from "../../utils/internal/FocusRingButton";
import ForcedColorsEdgeDialog from "../../utils/internal/ForcedColorsEdgeDialog";
import { useReportButtonError } from "./useReportButtonError";
// shown before the label of the button whose handler runs; the button's aria-disabled and
// the dialog's aria-busy tell assistive technology
const busyIndicator = (_jsx(CircularProgress, { color: "inherit", size: 16, "aria-hidden": true }));
const FormDialogRaw = (props) => {
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
    const reportButtonError = useReportButtonError("FormDialog.onClick");
    // Escape and the backdrop, ignored while a button's handler runs
    const removeDialog = React.useCallback(() => {
        if (getBusyButton() !== null)
            return;
        closeThisDialog?.();
        if (onClose)
            onClose();
    }, [getBusyButton, closeThisDialog, onClose]);
    const slotProps = useMemo(() => ({ paper: { "aria-busy": busy || undefined } }), [busy]);
    return (_jsxs(ForcedColorsEdgeDialog, { open: true, onClose: removeDialog, "aria-describedby": messageId, slotProps: slotProps, children: [_jsx(DialogTitle, { children: props.title }), _jsxs(DialogContent, { children: [_jsx(DialogContentText, { component: "div", id: messageId, children: props.message }), _jsx(_Fragment, { children: props.inputs })] }), _jsx(DialogActions, { children: props.buttons.map((btn, index) => (_jsx(FocusRingButton, { onClick: async () => {
                        if (getBusyButton() !== null)
                            return;
                        const { close, end } = dialogButtonClose(closeThisDialog, onClose);
                        try {
                            if (btn.onClick) {
                                setBusyButton(index);
                                try {
                                    await btn.onClick(close);
                                }
                                finally {
                                    setBusyButton(null);
                                }
                            }
                        }
                        catch (error) {
                            // the dialog stays open with its inputs, unless the handler closed it, so
                            // the user can try again; the error shows in an error dialog over it
                            reportButtonError(error);
                            return;
                        }
                        finally {
                            // the handler closed the dialog: report it closed, also when the handler
                            // failed, as nothing can close the dialog anymore
                            end();
                        }
                        if (!btn.dontClose)
                            close();
                    }, color: btn.color || "primary", autoFocus: btn.autoFocus, "aria-disabled": busy || undefined, className: busy ? buttonClasses.disabled : undefined, startIcon: busyButton === index ? busyIndicator : undefined, children: btn.text }, index))) })] }));
};
/**
 * Message dialog with `inputs` under the message and a row of buttons. Not the model form
 * dialog, which is `FullFormDialog`. Show it with `pushDialog(<FormDialog … />)`.
 *
 * A button runs its `onClick` while the dialog is open, then, unless `dontClose`, closes the
 * dialog and calls `onClose`, as ErrorDialog does. `onClick` gets a `close` that closes the
 * dialog at once; `onClose` is then called once the handler has ended, also with
 * `dontClose`. Escape and a backdrop click close it and call `onClose`.
 *
 * While a returned promise is awaited, the dialog ignores clicks on its buttons, Escape and
 * the backdrop, so a handler runs once per activation. If the dialog is still shown then
 * (the handler did not call `close`), it is `aria-busy`, its buttons are `aria-disabled` with
 * MUI's disabled look, and the pressed one shows a progress spinner before its label. The
 * buttons stay focusable, so keyboard focus stays on the pressed button.
 *
 * If `onClick` throws or its promise rejects, the dialog stays open with its inputs and its
 * buttons enabled again, and `onClose` is not called (unless the handler called `close`);
 * the error is reported (captureError, source `"FormDialog.onClick"`) and shown in an error
 * dialog over the dialog, as showErrorDialog shows it.
 *
 * It closes the dialog it was pushed in, and only that one, also when dialogs were pushed
 * after it. Rendered without pushDialog, it is always open: it closes through `onClose`,
 * which has to stop rendering it.
 */
export const FormDialog = React.memo(FormDialogRaw);
