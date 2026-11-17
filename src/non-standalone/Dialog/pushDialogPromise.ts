import type React from "react";
import type { DialogContextType } from "../../framework/DialogContextProvider";
import type { DialogPromise } from "./Utils";

/**
 * Pushes the dialog `render` returns and returns its result as a DialogPromise: the
 * helper behind the `show…Dialog` functions (internal, not exported from the package)
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param render Returns the dialog, given the promise's resolve and reject
 * @param dismiss Settles the promise when `close` closes the dialog, as dismissing it does
 */
export const pushDialogPromise = <T>(
	pushDialog: DialogContextType[0],
	render: (
		resolve: (value: T) => void,
		reject: (reason?: unknown) => void,
	) => React.ReactNode,
	dismiss: (
		resolve: (value: T) => void,
		reject: (reason?: unknown) => void,
	) => void,
): DialogPromise<T> => {
	let closeDialog: (() => void) | undefined;
	let settle: (() => void) | undefined;
	const promise = new Promise<T>((resolve, reject) => {
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
