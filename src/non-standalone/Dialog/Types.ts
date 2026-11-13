import React from "react";

/**
 * Configuration for a dialog button
 */
export interface IDialogButtonConfig {
	/**
	 * The button label
	 */
	text: React.ReactNode;
	/**
	 * Called when the button is clicked. A returned promise is awaited. Unless `dontClose` is
	 * set, the dialog closes and calls its `onClose` afterwards (FormDialog closes before the
	 * handler runs, and calls `onClose` afterwards). Navigation is blocked while a dialog is
	 * open, but not by a dialog that closes after the handler: without `dontClose` the handler
	 * may navigate, unless another dialog is open.
	 * @param close Closes the dialog this button belongs to, at once, and only that one, also
	 *              while dialogs pushed after it are open; e.g. before navigating from a
	 *              `dontClose` button. It does not call the dialog's `onClose`:
	 *              the dialog calls it once the handler has ended (returned, or its promise
	 *              settled, also rejected), so a `show…Dialog` helper's promise settles only
	 *              then. Called after the handler has ended, it calls `onClose` right away.
	 *              Calling it is optional (without `dontClose` the dialog closes after the
	 *              handler anyway), and calling it again does nothing. In a dialog rendered
	 *              without pushDialog it closes nothing itself: the dialog closes when its
	 *              `onClose`, called after the handler, stops rendering it.
	 * @remarks In a button of a dialog shown with a `show…Dialog` helper, close the dialog
	 *          with this `close`, not with the `close` of the helper's promise: that one
	 *          settles the promise at once, while the handler is still running.
	 * @example
	 * // closes the dialog, prints, and the code awaiting showInfoDialog continues after printing
	 * { text: "Print", onClick: async (close) => { close(); await print(); } }
	 * @see dontClose
	 */
	onClick?: (close: () => void) => void | Promise<void>;
	/**
	 * Should the button be initially focused?
	 */
	autoFocus?: boolean;
	/**
	 * The color of the button
	 */
	color?: "primary" | "secondary";
	/**
	 * Keeps the dialog open after `onClick`, e.g. for a button that copies or downloads
	 * something. The handler can still close it with the `close` it gets; the dialog then
	 * calls `onClose` once the handler has ended. If the handler does not call `close`, the
	 * dialog stays open and `onClose` is not called. Default false.
	 * @see onClick
	 */
	dontClose?: boolean;
}

/**
 * Simple dialog with text and buttons
 */
export interface IDialogConfigSimple {
	/**
	 * The title of the dialog
	 */
	title: string;
	/**
	 * The message contents of the dialog. They are the dialog's accessible
	 * description (`aria-describedby`).
	 */
	message: React.ReactNode;
	/**
	 * The close callback (dialog closes automatically)
	 */
	onClose?: () => void;
	/**
	 * The buttons of the dialog
	 */
	buttons: IDialogButtonConfig[];
}

/**
 * Simple confirmation dialog with yes/no
 */
export interface IDialogConfigConfirm {
	/**
	 * The title of the dialog
	 */
	title: string;
	/**
	 * The message contents. They are the dialog's accessible description
	 * (`aria-describedby`).
	 */
	message: React.ReactNode;
	/**
	 * The close callback (the dialog closes automatically)
	 */
	onClose?: () => void;
	/**
	 * The label on the yes button
	 */
	textButtonYes: React.ReactNode;
	/**
	 * The callback for the yes button (the dialog closes automatically). It may navigate.
	 */
	handlerButtonYes: () => void;
	/**
	 * The label on the no button
	 */
	textButtonNo: React.ReactNode;
	/**
	 * The callback for the no button (the dialog closes automatically). It may navigate.
	 */
	handlerButtonNo: () => void;
}

/**
 * Props which will be provided by the promise in the async handlers
 */
type DialogConfirmCallbackProps =
	"onClose" | "handlerButtonYes" | "handlerButtonNo";

/**
 * awaitable confirm dialog properties
 */
export type IDialogConfigConfirmAsync = Omit<
	IDialogConfigConfirm,
	DialogConfirmCallbackProps
>;

/**
 * Input dialog properties, extends confirm dialog.
 * Yes and No of confirm dialog could be labelled as Submit and Cancel.
 */
export interface IDialogConfigInput extends Omit<
	IDialogConfigConfirm,
	"handlerButtonYes"
> {
	/**
	 * The callback for the yes button (dialog closes automatically)
	 * @param value The value provided in the input
	 */
	handlerButtonYes: (value: string) => void;
	/**
	 * The input field label
	 */
	textFieldLabel: string;
	/**
	 * The input field placeholder
	 */
	textFieldPlaceholder?: string;
	/**
	 * The validator for the input field.
	 * Called when user presses "yes"
	 * @param value The current input
	 * @returns Value valid?
	 */
	textFieldValidator: (value: string) => boolean;
}

/**
 * Awaitable input dialog properties
 */
export type IDialogConfigInputAsync = Omit<
	IDialogConfigInput,
	DialogConfirmCallbackProps
>;

/**
 * Form dialog. State of inputs needs to be handled manually.
 * You most likely want to use this inside your own component, which handles state.
 */
export interface IDialogConfigForm extends IDialogConfigSimple {
	/**
	 * The inputs to be rendered
	 */
	inputs: React.ReactNode;
}

/**
 * Props which will be provided in sign pad dialog
 */
export interface IDialogConfigSign {
	/**
	 * The name of the input
	 */
	name?: string;
	/**
	 * Use to change signature pen color
	 */
	penColor?: string;
	/**
	 * The base64 string of signature, null while unsigned
	 */
	signature: string | null;
	/**
	 * Called when the user presses Save: with the drawn signature as a PNG data
	 * URL cropped to the ink, with `""` when the canvas holds no ink (also when
	 * the stored signature was cleared), or with the unchanged `signature` when
	 * it was shown and not cleared
	 */
	setSignature?: (url: string) => void;
	/**
	 * Name of the signer
	 */
	signerName?: string | null;
	/**
	 * Blur event
	 */
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
}
