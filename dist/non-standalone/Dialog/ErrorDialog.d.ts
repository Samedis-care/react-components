import React from "react";
import { IDialogConfigSimple } from "./Types";
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
export declare const ErrorDialog: React.MemoExoticComponent<(props: IDialogConfigSimple) => React.JSX.Element>;
