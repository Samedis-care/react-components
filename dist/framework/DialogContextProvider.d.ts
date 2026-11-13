import React from "react";
import type { IFrameworkProps } from "./Framework";
export type DialogType = React.ReactNode;
/**
 * The dialog functions of the nearest DialogContextProvider: `[pushDialog, popDialog]`.
 * pushDialog shows a dialog and returns a function that closes exactly that dialog;
 * popDialog closes the top-most dialog.
 */
export type DialogContextType = [
    /**
     * Shows `dialog` above the dialogs that are open already.
     * @returns A function that closes this dialog, and only this one, also while dialogs
     *          pushed after it are open. It is the function useCloseThisDialog returns inside
     *          the dialog, the same one for the life of the dialog. Calling it again, or after
     *          the dialog was closed another way (popDialog, the dialog's own close), does
     *          nothing.
     * @remarks Use the returned function to close the dialog from the code that pushed it
     *          (a timeout, a response, the page that opened it), where useCloseThisDialog is
     *          not available. Inside the dialog, useCloseThisDialog gives the same function.
     */
    pushDialog: (dialog: React.ReactNode) => () => void,
    /**
     * Closes the top-most dialog of this provider; without one, the top-most dialog of the
     * DialogContextProvider around it.
     * @throws Error when no dialog is open
     * @remarks The top-most dialog is a different one when a dialog was pushed after the one
     *          you mean to close. To close a specific dialog, use the function pushDialog
     *          returned, or useCloseThisDialog inside the dialog.
     */
    popDialog: () => void
];
/**
 * Context for the dialog state
 */
export declare const DialogContext: React.Context<DialogContextType | undefined>;
/**
 * Returns the dialog functions `[pushDialog, popDialog]` of the nearest
 * DialogContextProvider (part of Framework). pushDialog returns a function that closes the
 * dialog it pushed; see DialogContextType.
 * @throws Error when there is no DialogContextProvider around the calling component
 */
export declare const useDialogContext: () => DialogContextType;
declare const _default: React.MemoExoticComponent<(props: IFrameworkProps) => React.JSX.Element>;
export default _default;
