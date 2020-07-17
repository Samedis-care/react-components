import React from "react";

/**
 * Configuration for a dialog button
 */
export interface IDialogButtonConfig {
	/**
	 * The button label
	 */
	text: string;
	/**
	 * The action to perform if the button is clicked (the dialog will be closed automatically)
	 */
	onClick?: () => void;
	/**
	 * Should the button be initially focused?
	 */
	autoFocus?: boolean;
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
	 * The message contents of the dialog
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
	 * The message contents
	 */
	message: React.ReactNode;
	/**
	 * The close callback (the dialog closes automatically)
	 */
	onClose?: () => void;
	/**
	 * The label on the yes button
	 */
	textButtonYes: string;
	/**
	 * The callback for the yes button (the dialog closes automatically)
	 */
	handlerButtonYes: () => void;
	/**
	 * The label on the no button
	 */
	textButtonNo: string;
	/**
	 * The callback for the no button (the dialog closes automatically)
	 */
	handlerButtonNo: () => void;
}

/**
 * Props which will be provided by the promise in the async handlers
 */
type DialogConfirmCallbackProps =
	| "onClose"
	| "handlerButtonYes"
	| "handlerButtonNo";

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
export interface IDialogConfigInput
	extends Omit<IDialogConfigConfirm, "handlerButtonYes"> {
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
	inputs: JSX.Element[];
}
