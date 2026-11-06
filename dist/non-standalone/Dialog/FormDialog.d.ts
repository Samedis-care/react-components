import React from "react";
import { IDialogConfigForm } from "./Types";
/**
 * Message dialog with `inputs` under the message and a row of buttons. Not the model form
 * dialog, which is `FullFormDialog`. Show it with `pushDialog(<FormDialog … />)`.
 *
 * A button closes the dialog (unless `dontClose`), awaits its `onClick`, then calls `onClose`
 * (unless `dontClose`), also when the handler failed. `onClick` gets a `close` that closes the
 * dialog at once; with `dontClose`, `onClose` is then called once the handler has ended.
 * Escape and a backdrop click close it and call `onClose`. It
 * closes the dialog it was pushed in, and only that one, also when dialogs were pushed after
 * it. Rendered without pushDialog, it is always open: it closes through `onClose`, which has
 * to stop rendering it.
 */
export declare const FormDialog: React.MemoExoticComponent<(props: IDialogConfigForm) => React.JSX.Element>;
