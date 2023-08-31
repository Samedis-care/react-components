import React from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { InputDialog } from "./InputDialog";
import { InfoDialog } from "./InfoDialog";
import i18n from "../../i18n";
import { ErrorDialog } from "./ErrorDialog";
/**
 * Shows an awaitable confirm dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties
 * @returns Awaitable promise, resolves if user clicks Yes, rejects otherwise
 */
export const showConfirmDialog = async (pushDialog, props) => {
    return new Promise((resolve, reject) => {
        pushDialog(React.createElement(ConfirmDialog, { ...props, onClose: reject, handlerButtonYes: resolve, handlerButtonNo: reject }));
    });
};
/**
 * Shows an awaitable confirm dialog (returns boolean)
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties
 * @returns Awaitable promise, resolves to true if user clicks yes, to false if user clicks no or closes dialog
 */
export const showConfirmDialogBool = async (pushDialog, props) => {
    return new Promise((resolve) => {
        pushDialog(React.createElement(ConfirmDialog, { ...props, onClose: () => resolve(false), handlerButtonYes: () => resolve(true), handlerButtonNo: () => resolve(false) }));
    });
};
/**
 * Shows an awaitable input dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties
 * @returns Awaitable promise, resolves if user clicks Yes, rejects otherwise
 */
export const showInputDialog = async (pushDialog, props) => {
    return new Promise((resolve, reject) => {
        pushDialog(React.createElement(InputDialog, { ...props, onClose: reject, handlerButtonYes: resolve, handlerButtonNo: reject }));
    });
};
/**
 * Shows an info dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties (with buttons optional, defaults to an Okay button)
 * @return A promise which resolves when the dialog is closed
 */
export const showInfoDialog = (pushDialog, props) => {
    const { title, message, buttons } = props;
    return new Promise((resolve) => {
        pushDialog(React.createElement(InfoDialog, { title: title, message: message, buttons: buttons ?? [
                {
                    text: i18n.t("non-standalone.dialog.okay"),
                    autoFocus: true,
                },
            ], onClose: resolve }));
    });
};
/**
 * Shows an error dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param e The error or validation error
 * @return A promise which resolves when the dialog is closed
 */
export const showErrorDialog = (pushDialog, e) => {
    // display generic errors and validation errors
    let errorTitle = "";
    let errorMsg = "";
    if (e instanceof Error) {
        errorTitle = i18n.t("common.dialogs.error-title");
        errorMsg = e.message;
    }
    else if (typeof e === "string") {
        errorTitle = i18n.t("common.dialogs.error-title");
        errorMsg = e;
    }
    else {
        // validation error
        errorTitle = i18n.t("common.dialogs.validation-error-title");
        errorMsg = (React.createElement("ul", null, Object.entries(e).map(([key, value]) => (React.createElement("li", { key: key }, value)))));
    }
    return new Promise((resolve) => {
        pushDialog(React.createElement(ErrorDialog, { title: errorTitle, message: errorMsg, buttons: [
                {
                    text: i18n.t("common.buttons.ok"),
                    autoFocus: true,
                },
            ], onClose: resolve }));
    });
};
