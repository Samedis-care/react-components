/**
 * Pushes the dialog `render` returns and returns its result as a DialogPromise: the
 * helper behind the `show…Dialog` functions (internal, not exported from the package)
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param render Returns the dialog, given the promise's resolve and reject
 * @param dismiss Settles the promise when `close` closes the dialog, as dismissing it does
 */
export const pushDialogPromise = (pushDialog, render, dismiss) => {
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
