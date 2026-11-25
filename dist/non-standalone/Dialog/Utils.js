import { jsx as _jsx } from "react/jsx-runtime";
import { ConfirmDialog } from "./ConfirmDialog";
import { InputDialog } from "./InputDialog";
import { InfoDialog } from "./InfoDialog";
import i18n from "../../i18n";
import { ErrorDialog } from "./ErrorDialog";
import { isValidationError } from "../../backend-components";
import { pushDialogPromise } from "./pushDialogPromise";
/**
 * Shows an awaitable confirm dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties
 * @returns A DialogPromise: resolves if the user clicks Yes, rejects with `undefined` on No,
 *          Escape and a backdrop click. Its `close()` closes the dialog and rejects it with
 *          `undefined` at once, so handle that rejection as the one of No.
 */
export const showConfirmDialog = (pushDialog, props) => pushDialogPromise(pushDialog, (resolve, reject) => (_jsx(ConfirmDialog, { ...props, onClose: reject, handlerButtonYes: resolve, handlerButtonNo: reject })), (_resolve, reject) => reject());
/**
 * Shows an awaitable confirm dialog (returns boolean)
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties
 * @returns A DialogPromise: resolves to true if the user clicks Yes, to false on No, Escape
 *          and a backdrop click. Its `close()` closes the dialog and resolves it to false at
 *          once.
 */
export const showConfirmDialogBool = (pushDialog, props) => pushDialogPromise(pushDialog, (resolve) => (_jsx(ConfirmDialog, { ...props, onClose: () => resolve(false), handlerButtonYes: () => resolve(true), handlerButtonNo: () => resolve(false) })), (resolve) => resolve(false));
/**
 * Shows an awaitable input dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties
 * @returns A DialogPromise: resolves with the entered value if the user clicks Yes, rejects
 *          with `undefined` on No, Escape and a backdrop click. Its `close()` closes the
 *          dialog and rejects it with `undefined` at once, so handle that rejection as the one
 *          of No.
 */
export const showInputDialog = (pushDialog, props) => pushDialogPromise(pushDialog, (resolve, reject) => (_jsx(InputDialog, { ...props, onClose: reject, handlerButtonYes: resolve, handlerButtonNo: reject })), (_resolve, reject) => reject());
/**
 * Shows an info dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties (with buttons optional, defaults to an Okay button)
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
export const showInfoDialog = (pushDialog, props) => {
    const { title, message, buttons } = props;
    return pushDialogPromise(pushDialog, (resolve) => (_jsx(InfoDialog, { title: title, message: message, buttons: buttons ?? [
            {
                text: i18n.t("non-standalone.dialog.okay"),
                autoFocus: true,
            },
        ], onClose: resolve })), (resolve) => resolve());
};
/** whether `e` is an Error, also one from another realm (an iframe, a VM context) */
const isError = (e) => e instanceof Error || Object.prototype.toString.call(e) === "[object Error]";
/**
 * whether a ValidationError's result has messages to list: an object with at least one
 * entry, all of them strings (one built in untyped code may lack it or hold other values)
 */
const hasMessages = (result) => {
    if (typeof result !== "object" || result === null)
        return false;
    const messages = Object.values(result);
    return (messages.length > 0 &&
        messages.every((message) => typeof message === "string"));
};
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
export const showErrorDialog = (pushDialog, e) => {
    // display generic errors and validation errors
    let errorTitle = i18n.t("common.dialogs.error-title");
    let errorMsg = i18n.t("common.dialogs.error-no-details");
    if (isError(e)) {
        if (isValidationError(e) && hasMessages(e.result)) {
            errorTitle = i18n.t("common.dialogs.validation-error-title");
            errorMsg = (_jsx("ul", { children: Object.entries(e.result).map(([key, value]) => (_jsx("li", { children: value }, key))) }));
        }
        else {
            errorMsg = e.message;
        }
    }
    else if (typeof e === "string") {
        errorMsg = e;
    }
    return pushDialogPromise(pushDialog, (resolve) => (_jsx(ErrorDialog, { title: errorTitle, message: errorMsg, buttons: [
            {
                text: i18n.t("common.buttons.ok"),
                autoFocus: true,
            },
        ], onClose: resolve })), (resolve) => resolve());
};
