import { createContext, useContext } from "react";
/**
 * Set by DialogContextProvider around every pushed dialog. A FullFormDialog shown with
 * pushDialog passes its close on to its content (`pushed: false`, so that a FullFormDialog
 * rendered there without pushDialog does not take it for its own); one rendered without
 * pushDialog sets null. null outside a pushed dialog.
 * @remarks Internal
 */
export const PushedDialogCloseContext = createContext(null);
/**
 * Returns a function that closes the dialog the calling component was pushed in (pushDialog),
 * and only that one, also while dialogs pushed after it are open. Inside a FullFormDialog it
 * closes that dialog, without "Leave form page?" and without calling its onClose. Calling the
 * function again, or after the dialog was closed another way (popDialog), does nothing.
 * @returns The close function; the same one for the life of the dialog
 * @throws Error when the calling component is not inside a dialog shown with pushDialog, or is
 *         inside a FullFormDialog rendered without pushDialog (close that one through the state
 *         that renders it)
 */
export const useCloseThisDialog = () => {
    const ctx = useContext(PushedDialogCloseContext);
    if (!ctx)
        throw new Error("[Components-Care] useCloseThisDialog: not inside a dialog shown with pushDialog. Push the dialog with pushDialog (useDialogContext), or close a dialog rendered without it through the state that renders it.");
    return ctx.close;
};
