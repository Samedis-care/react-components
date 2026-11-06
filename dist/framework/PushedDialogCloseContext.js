import { createContext, useContext } from "react";
/**
 * The close of the dialog a component is in; null outside a dialog shown with pushDialog.
 * DialogContextProvider sets it around every pushed dialog (`pushed: true`). A FullFormDialog
 * shown with pushDialog passes its close on to its content (`pushed: false`, so that a
 * FullFormDialog rendered there without pushDialog does not take it for its own); one
 * rendered without pushDialog sets null for its content.
 *
 * - Read it (`useContext`) where a component may be shown in a pushed dialog or outside one:
 *   it is null outside, where useCloseThisDialog throws.
 * - Provide it, with `pushed: true` like DialogContextProvider, around a dialog that was not
 *   pushed (one rendered from state), so that useCloseThisDialog in that dialog closes it, and
 *   so do the X, Escape and backdrop of a FullFormDialog that is that dialog. Tests provide it
 *   the same way. Keep the value stable, e.g.
 *   `useMemo(() => ({ close: () => setOpen(false), pushed: true }), [])`.
 */
export const PushedDialogCloseContext = createContext(null);
/**
 * Returns a function that closes the dialog the calling component was pushed in (pushDialog),
 * and only that one, also while dialogs pushed after it are open. Inside a FullFormDialog it
 * closes that dialog, without "Leave form page?" and without calling its onClose. Calling the
 * function again, or after the dialog was closed another way (popDialog), does nothing.
 * @returns The close function; the same one for the life of the dialog, and the one
 *          pushDialog returned when it showed the dialog
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
