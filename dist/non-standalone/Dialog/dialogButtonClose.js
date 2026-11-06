/**
 * Creates the close for one click on a dialog button (ErrorDialog, FormDialog). The dialog
 * closes at once when `close` is called; `onClose` follows once the handler has ended, so
 * the code waiting for the dialog continues after the handler's work.
 * @param closeThisDialog Closes the dialog by identity; null when the dialog was rendered
 *                        without pushDialog, which closes through `onClose`
 * @param onClose The dialog's onClose
 */
export const dialogButtonClose = (closeThisDialog, onClose) => {
    let closed = false;
    let ended = false;
    return {
        close: () => {
            if (closed)
                return;
            closed = true;
            closeThisDialog?.();
            if (ended && onClose)
                onClose();
        },
        end: () => {
            if (ended)
                return;
            ended = true;
            if (closed && onClose)
                onClose();
        },
    };
};
