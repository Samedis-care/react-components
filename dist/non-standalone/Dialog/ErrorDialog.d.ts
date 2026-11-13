import React from "react";
import { IDialogConfigSimple } from "./Types";
/**
 * Message dialog with a title, a message and a row of buttons; InfoDialog and ConfirmDialog
 * render it. Show it with `pushDialog(<ErrorDialog … />)`, or use `showErrorDialog` /
 * `showInfoDialog`.
 *
 * A button runs its `onClick` while the dialog is open (a returned promise is awaited with the
 * buttons disabled and Escape and the backdrop ignored), then, unless `dontClose`, closes the
 * dialog and calls `onClose`. `onClick` gets a `close` that closes the dialog at once;
 * `onClose` is then called once the handler has ended, also with `dontClose`. Escape and a
 * backdrop click close it and call `onClose`.
 * It closes the dialog it was pushed in, and only that one, also when dialogs were pushed
 * after it. Rendered without pushDialog, it is always open: it closes through `onClose`,
 * which has to stop rendering it.
 */
export declare const ErrorDialog: React.MemoExoticComponent<(props: IDialogConfigSimple) => React.JSX.Element>;
