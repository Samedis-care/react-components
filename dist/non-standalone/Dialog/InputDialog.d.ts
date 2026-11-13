import React from "react";
import { IDialogConfigInput } from "./Types";
/**
 * Text prompt with a title, a message, a text field and the buttons `textButtonNo` and
 * `textButtonYes`. Show it with `pushDialog(<InputDialog … />)`, or use `showInputDialog`.
 *
 * Yes, once `textFieldValidator` accepts the value, closes the dialog and calls
 * `handlerButtonYes`. While the validator rejects the value, the field is marked invalid
 * and described by `textFieldErrorText`, and Yes moves focus to the field instead.
 * No closes it and calls `handlerButtonNo`; Escape and a backdrop click
 * close it and call `onClose`. It closes the dialog it was pushed in, and only that one, also
 * when dialogs were pushed after it. Rendered without pushDialog, it is always open: it closes
 * through `onClose` and the button handlers, which have to stop rendering it.
 */
export declare const InputDialog: React.MemoExoticComponent<(props: IDialogConfigInput) => React.JSX.Element>;
