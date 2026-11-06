/**
 * The close a dialog button's `onClick` gets, for one click, and the end of that click
 */
export interface DialogButtonClose {
    /**
     * Closes the dialog at once, once; the `close` the button's `onClick` gets. Called after
     * `end`, it also calls `onClose`.
     */
    close: () => void;
    /**
     * Marks the button's handler as ended (returned, or its promise settled, also rejected):
     * calls `onClose` if `close` was called
     */
    end: () => void;
}
/**
 * Creates the close for one click on a dialog button (ErrorDialog, FormDialog). The dialog
 * closes at once when `close` is called; `onClose` follows once the handler has ended, so
 * the code waiting for the dialog continues after the handler's work.
 * @param closeThisDialog Closes the dialog by identity; null when the dialog was rendered
 *                        without pushDialog, which closes through `onClose`
 * @param onClose The dialog's onClose
 */
export declare const dialogButtonClose: (closeThisDialog: (() => void) | null, onClose: (() => void) | undefined) => DialogButtonClose;
