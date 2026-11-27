import React from "react";
import { IDialogConfigForm } from "./Types";
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
export declare const FormDialog: React.MemoExoticComponent<(props: IDialogConfigForm) => React.JSX.Element>;
