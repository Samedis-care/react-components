import { DialogContextType } from "../../framework/DialogContextProvider";
import { IDialogConfigConfirmAsync, IDialogConfigInputAsync, IDialogConfigSimple } from "./Types";
/**
 * What the `show…Dialog` helpers return: the promise of the dialog's result, with `close`,
 * which closes that dialog from outside it. Await it like any promise; only this promise has
 * `close`, the ones `then`, `catch` and `finally` return don't.
 * @example
 * const info = showInfoDialog(pushDialog, { title, message });
 * // later, e.g. when the record it is about was deleted meanwhile
 * info.close();
 */
export type DialogPromise<T> = Promise<T> & {
    /**
     * Closes the dialog the helper pushed, and only that one, also while dialogs pushed after
     * it are open, and settles the promise at once, as dismissing the dialog with Escape does
     * (see the helper's `@returns`). Calling it again, or after the dialog was closed another
     * way, does nothing.
     * @remarks In a handler of one of the dialog's own buttons, close the dialog with the
     *          `close` the handler gets (IDialogButtonConfig.onClick), not with this one: this
     *          one settles the promise at once, the handler's lets it settle once the handler
     *          has ended.
     */
    close: () => void;
};
/**
 * Shows an awaitable confirm dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties
 * @returns A DialogPromise: resolves if the user clicks Yes, rejects with `undefined` on No,
 *          Escape and a backdrop click. Its `close()` closes the dialog and rejects it with
 *          `undefined` at once, so handle that rejection as the one of No.
 */
export declare const showConfirmDialog: (pushDialog: DialogContextType[0], props: IDialogConfigConfirmAsync) => DialogPromise<void>;
/**
 * Shows an awaitable confirm dialog (returns boolean)
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties
 * @returns A DialogPromise: resolves to true if the user clicks Yes, to false on No, Escape
 *          and a backdrop click. Its `close()` closes the dialog and resolves it to false at
 *          once.
 */
export declare const showConfirmDialogBool: (pushDialog: DialogContextType[0], props: IDialogConfigConfirmAsync) => DialogPromise<boolean>;
/**
 * Shows an awaitable input dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties
 * @returns A DialogPromise: resolves with the entered value if the user clicks Yes, rejects
 *          with `undefined` on No, Escape and a backdrop click. Its `close()` closes the
 *          dialog and rejects it with `undefined` at once, so handle that rejection as the one
 *          of No.
 */
export declare const showInputDialog: (pushDialog: DialogContextType[0], props: IDialogConfigInputAsync) => DialogPromise<string>;
/**
 * Shows an info dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties (with buttons optional, defaults to an Okay button).
 *              `onClose` is called when the dialog has closed, in each of the ways that
 *              resolve the promise (see `@returns`), once, and before the code awaiting the
 *              promise continues.
 * @returns A DialogPromise that resolves when the dialog is closed: by a button once its
 *          handler has ended, by Escape or a backdrop click. Its `close()` closes the dialog
 *          and resolves it at once.
 * @example
 * // a button that leads somewhere: the dialog closes after the handler, then the awaiting
 * // code continues
 * await showInfoDialog(pushDialog, {
 * 	title,
 * 	message,
 * 	buttons: [{ text: "Open", onClick: () => navigate(target) }],
 * });
 * @example
 * // closing the dialog from outside it
 * const info = showInfoDialog(pushDialog, { title, message });
 * info.close();
 */
export declare const showInfoDialog: (pushDialog: DialogContextType[0], props: Omit<IDialogConfigSimple, "buttons"> & Partial<Pick<IDialogConfigSimple, "buttons">>) => DialogPromise<void>;
/**
 * Shows an error dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param e What went wrong, typically the value a `catch` received. Any value is shown:
 *          - a ValidationError lists the messages of its `result` (its values, not its keys)
 *            under `common.dialogs.validation-error-title` ("Error on validation"); one with
 *            an empty result shows its `message` as any other Error does. To show the
 *            ValidationResult a validate function returned, such as `validateForm()`, wrap
 *            it: `new ValidationError("error", result)`
 *          - any other Error (also one from another realm) shows its `message` under the
 *            title `common.dialogs.error-title` ("An error occurred")
 *          - a string is shown as it is, under the same title
 *          - anything else (`null`, `undefined`, a number, any plain object, also a
 *            ValidationResult or `{ title, message }`) shows `common.dialogs.error-no-details`
 *            ("No further details are available. Try again.") under the error title. For an
 *            error dialog with a title of your own, use showInfoDialog, which renders the
 *            same dialog.
 * @returns A DialogPromise that resolves when the dialog is closed (OK, Escape, a backdrop
 *          click). Its `close()` closes the dialog and resolves it at once.
 */
export declare const showErrorDialog: (pushDialog: DialogContextType[0], e: unknown) => DialogPromise<void>;
