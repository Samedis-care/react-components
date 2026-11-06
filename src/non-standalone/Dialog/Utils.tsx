import React from "react";
import { DialogContextType } from "../../framework/DialogContextProvider";
import {
	IDialogConfigConfirmAsync,
	IDialogConfigInputAsync,
	IDialogConfigSimple,
} from "./Types";
import { ConfirmDialog } from "./ConfirmDialog";
import { InputDialog } from "./InputDialog";
import { InfoDialog } from "./InfoDialog";
import i18n from "../../i18n";
import { ErrorDialog } from "./ErrorDialog";
import type { ValidationResult } from "../../backend-components/Form/Form";
import { isValidationError } from "../../backend-components";

/**
 * What the `show…Dialog` helpers return: the promise of the dialog's result, with `close`,
 * which closes that dialog from outside it. Await it like any promise; only this promise has
 * `close`, the ones `then`, `catch` and `finally` return don't.
 * @example
 * const info = showInfoDialog(pushDialog, { title, message });
 * // later, e.g. when the record it is about was deleted meanwhile
 * info.close();
 */
export type DialogPromise<T> = Promise<T> & {
	/**
	 * Closes the dialog the helper pushed, and only that one, also while dialogs pushed after
	 * it are open, and settles the promise at once, as dismissing the dialog with Escape does
	 * (see the helper's `@returns`). Navigation, which is blocked while a dialog is open, works
	 * right after it. Calling it again, or after the dialog was closed another way, does
	 * nothing.
	 * @remarks In a handler of one of the dialog's own buttons, close the dialog with the
	 *          `close` the handler gets (IDialogButtonConfig.onClick), not with this one: this
	 *          one settles the promise at once, the handler's lets it settle once the handler
	 *          has ended.
	 */
	close: () => void;
};

/**
 * Pushes the dialog `render` returns and returns its result as a DialogPromise
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param render Returns the dialog, given the promise's resolve and reject
 * @param dismiss Settles the promise when `close` closes the dialog, as dismissing it does
 */
const pushDialogPromise = <T,>(
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

/**
 * Shows an awaitable confirm dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties
 * @returns A DialogPromise: resolves if the user clicks Yes, rejects with `undefined` on No,
 *          Escape and a backdrop click. Its `close()` closes the dialog and rejects it with
 *          `undefined` at once, so handle that rejection as the one of No.
 */
export const showConfirmDialog = (
	pushDialog: DialogContextType[0],
	props: IDialogConfigConfirmAsync,
): DialogPromise<void> =>
	pushDialogPromise<void>(
		pushDialog,
		(resolve, reject) => (
			<ConfirmDialog
				{...props}
				onClose={reject}
				handlerButtonYes={resolve}
				handlerButtonNo={reject}
			/>
		),
		(_resolve, reject) => reject(),
	);

/**
 * Shows an awaitable confirm dialog (returns boolean)
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties
 * @returns A DialogPromise: resolves to true if the user clicks Yes, to false on No, Escape
 *          and a backdrop click. Its `close()` closes the dialog and resolves it to false at
 *          once.
 */
export const showConfirmDialogBool = (
	pushDialog: DialogContextType[0],
	props: IDialogConfigConfirmAsync,
): DialogPromise<boolean> =>
	pushDialogPromise<boolean>(
		pushDialog,
		(resolve) => (
			<ConfirmDialog
				{...props}
				onClose={() => resolve(false)}
				handlerButtonYes={() => resolve(true)}
				handlerButtonNo={() => resolve(false)}
			/>
		),
		(resolve) => resolve(false),
	);

/**
 * Shows an awaitable input dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties
 * @returns A DialogPromise: resolves with the entered value if the user clicks Yes, rejects
 *          with `undefined` on No, Escape and a backdrop click. Its `close()` closes the
 *          dialog and rejects it with `undefined` at once, so handle that rejection as the one
 *          of No.
 */
export const showInputDialog = (
	pushDialog: DialogContextType[0],
	props: IDialogConfigInputAsync,
): DialogPromise<string> =>
	pushDialogPromise<string>(
		pushDialog,
		(resolve, reject) => (
			<InputDialog
				{...props}
				onClose={reject}
				handlerButtonYes={resolve}
				handlerButtonNo={reject}
			/>
		),
		(_resolve, reject) => reject(),
	);

/**
 * Shows an info dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties (with buttons optional, defaults to an Okay button)
 * @returns A DialogPromise that resolves when the dialog is closed: by a button once its
 *          handler has ended, by Escape or a backdrop click. Its `close()` closes the dialog
 *          and resolves it at once.
 * @example
 * // a button that navigates closes the dialog first, as navigation is blocked while a dialog
 * // is open. It uses the close it gets: the awaiting code continues after the handler.
 * await showInfoDialog(pushDialog, {
 * 	title,
 * 	message,
 * 	buttons: [{ text: "Open", onClick: (close) => { close(); navigate(target); } }],
 * });
 * @example
 * // closing the dialog from outside it
 * const info = showInfoDialog(pushDialog, { title, message });
 * info.close();
 */
export const showInfoDialog = (
	pushDialog: DialogContextType[0],
	props: Omit<IDialogConfigSimple, "buttons"> &
		Partial<Pick<IDialogConfigSimple, "buttons">>,
): DialogPromise<void> => {
	const { title, message, buttons } = props;
	return pushDialogPromise<void>(
		pushDialog,
		(resolve) => (
			<InfoDialog
				title={title}
				message={message}
				buttons={
					buttons ?? [
						{
							text: i18n.t("non-standalone.dialog.okay"),
							autoFocus: true,
						},
					]
				}
				onClose={resolve}
			/>
		),
		(resolve) => resolve(),
	);
};

/**
 * Shows an error dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param e The error or validation error
 * @returns A DialogPromise that resolves when the dialog is closed (OK, Escape, a backdrop
 *          click). Its `close()` closes the dialog and resolves it at once.
 */
export const showErrorDialog = (
	pushDialog: DialogContextType[0],
	e: Error | ValidationResult | string,
): DialogPromise<void> => {
	// display generic errors and validation errors
	let errorTitle = "";
	let errorMsg: React.ReactNode = "";

	const setValuesForValidationError = (e: ValidationResult) => {
		// validation error
		errorTitle = i18n.t("common.dialogs.validation-error-title");
		errorMsg = (
			<ul>
				{Object.entries(e).map(([key, value]) => (
					<li key={key}>{value}</li>
				))}
			</ul>
		);
	};
	if (e instanceof Error) {
		if (isValidationError(e)) {
			setValuesForValidationError(e.result);
		} else {
			errorTitle = i18n.t("common.dialogs.error-title");
			errorMsg = e.message;
		}
	} else if (typeof e === "string") {
		errorTitle = i18n.t("common.dialogs.error-title");
		errorMsg = e;
	} else {
		setValuesForValidationError(e);
	}
	return pushDialogPromise<void>(
		pushDialog,
		(resolve) => (
			<ErrorDialog
				title={errorTitle}
				message={errorMsg}
				buttons={[
					{
						text: i18n.t("common.buttons.ok"),
						autoFocus: true,
					},
				]}
				onClose={resolve}
			/>
		),
		(resolve) => resolve(),
	);
};
