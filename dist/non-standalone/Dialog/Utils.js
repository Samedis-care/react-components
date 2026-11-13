import { jsx as _jsx } from "react/jsx-runtime";
import { ConfirmDialog } from "./ConfirmDialog";
import { InputDialog } from "./InputDialog";
import { InfoDialog } from "./InfoDialog";
import i18n from "../../i18n";
import { ErrorDialog } from "./ErrorDialog";
import { isValidationError } from "../../backend-components";
/**
 * Pushes the dialog `render` returns and returns its result as a DialogPromise
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param render Returns the dialog, given the promise's resolve and reject
 * @param dismiss Settles the promise when `close` closes the dialog, as dismissing it does
 */
const pushDialogPromise = (pushDialog, render, dismiss) => {
    let closeDialog;
    let settle;
    const promise = new Promise((resolve, reject) => {
        settle = () => dismiss(resolve, reject);
        closeDialog = pushDialog(render(resolve, reject));
    });
    return Object.assign(promise, {
        close: () => {
            closeDialog?.();
            settle?.();
        },
    });
};
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
/**
 * Shows an error dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param e The error or validation error
 * @returns A DialogPromise that resolves when the dialog is closed (OK, Escape, a backdrop
 *          click). Its `close()` closes the dialog and resolves it at once.
 */
export const showErrorDialog = (pushDialog, e) => {
    // display generic errors and validation errors
    let errorTitle = "";
    let errorMsg = "";
    const setValuesForValidationError = (e) => {
        // validation error
        errorTitle = i18n.t("common.dialogs.validation-error-title");
        errorMsg = (_jsx("ul", { children: Object.entries(e).map(([key, value]) => (_jsx("li", { children: value }, key))) }));
    };
    if (e instanceof Error) {
        if (isValidationError(e)) {
            setValuesForValidationError(e.result);
        }
        else {
            errorTitle = i18n.t("common.dialogs.error-title");
            errorMsg = e.message;
        }
    }
    else if (typeof e === "string") {
        errorTitle = i18n.t("common.dialogs.error-title");
        errorMsg = e;
    }
    else {
        setValuesForValidationError(e);
    }
    return pushDialogPromise(pushDialog, (resolve) => (_jsx(ErrorDialog, { title: errorTitle, message: errorMsg, buttons: [
            {
                text: i18n.t("common.buttons.ok"),
                autoFocus: true,
            },
        ], onClose: resolve })), (resolve) => resolve());
};
