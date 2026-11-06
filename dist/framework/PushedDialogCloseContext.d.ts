/**
 * The close of the innermost dialog around a component
 * @remarks Internal: read it with useCloseThisDialog
 */
export interface PushedDialogClose {
    /**
     * Closes the dialog shown with pushDialog, and only that one, also while dialogs pushed
     * after it are open. Calling it again, or after the dialog was closed another way
     * (popDialog), does nothing.
     */
    close: () => void;
    /**
     * true where DialogContextProvider set it around a pushed dialog, false where a
     * FullFormDialog set it for its content
     */
    pushed: boolean;
}
/**
 * Set by DialogContextProvider around every pushed dialog. A FullFormDialog shown with
 * pushDialog passes its close on to its content (`pushed: false`, so that a FullFormDialog
 * rendered there without pushDialog does not take it for its own); one rendered without
 * pushDialog sets null. null outside a pushed dialog.
 * @remarks Internal
 */
export declare const PushedDialogCloseContext: import("react").Context<PushedDialogClose | null>;
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
export declare const useCloseThisDialog: () => (() => void);
