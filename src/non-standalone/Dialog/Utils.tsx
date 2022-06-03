import React from "react";
import { DialogContextType } from "../../framework";
import {
	IDialogConfigConfirmAsync,
	IDialogConfigInputAsync,
	IDialogConfigSimple,
	IDialogConfigSign,
} from "./Types";
import { ConfirmDialog } from "./ConfirmDialog";
import { InputDialog } from "./InputDialog";
import { InfoDialog } from "./InfoDialog";
import { SignDialog } from "./SignPadDialog";
import i18n from "../../i18n";
import { ErrorDialog } from "./ErrorDialog";
import { ValidationError } from "../../backend-components";

/**
 * Shows an awaitable confirm dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties
 * @returns Awaitable promise, resolves if user clicks Yes, rejects otherwise
 */
export const showConfirmDialog = async (
	pushDialog: DialogContextType[0],
	props: IDialogConfigConfirmAsync
): Promise<void> => {
	return new Promise((resolve, reject) => {
		pushDialog(
			<ConfirmDialog
				{...props}
				onClose={reject}
				handlerButtonYes={resolve}
				handlerButtonNo={reject}
			/>
		);
	});
};

/**
 * Shows an awaitable confirm dialog (returns boolean)
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties
 * @returns Awaitable promise, resolves to true if user clicks yes, to false if user clicks no or closes dialog
 */
export const showConfirmDialogBool = async (
	pushDialog: DialogContextType[0],
	props: IDialogConfigConfirmAsync
): Promise<boolean> => {
	return new Promise((resolve) => {
		pushDialog(
			<ConfirmDialog
				{...props}
				onClose={() => resolve(false)}
				handlerButtonYes={() => resolve(true)}
				handlerButtonNo={() => resolve(false)}
			/>
		);
	});
};

/**
 * Shows an awaitable input dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties
 * @returns Awaitable promise, resolves if user clicks Yes, rejects otherwise
 */
export const showInputDialog = async (
	pushDialog: DialogContextType[0],
	props: IDialogConfigInputAsync
): Promise<string> => {
	return new Promise((resolve, reject) => {
		pushDialog(
			<InputDialog
				{...props}
				onClose={reject}
				handlerButtonYes={resolve}
				handlerButtonNo={reject}
			/>
		);
	});
};

/**
 * Shows an info dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties (with buttons optional, defaults to an Okay button)
 * @return A promise which resolves when the dialog is closed
 */
export const showInfoDialog = (
	pushDialog: DialogContextType[0],
	props: Omit<IDialogConfigSimple, "buttons"> &
		Partial<Pick<IDialogConfigSimple, "buttons">>
): Promise<void> => {
	const { title, message, buttons } = props;
	return new Promise((resolve) => {
		pushDialog(
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
		);
	});
};

/**
 * Shows signature pad dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties for sign pad
 */
export const showSignPadDialog = (
	pushDialog: DialogContextType[0],
	props: IDialogConfigSign
): void => {
	pushDialog(<SignDialog {...props} />);
};

/**
 * Shows an error dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param e The error or validation error
 * @return A promise which resolves when the dialog is closed
 */
export const showErrorDialog = (
	pushDialog: DialogContextType[0],
	e: Error | ValidationError
): Promise<void> => {
	// display generic errors and validation errors
	let errorTitle = "";
	let errorMsg: React.ReactNode = "";
	if (e instanceof Error) {
		errorTitle = i18n.t("common.dialogs.error-title");
		errorMsg = e.message;
	} else {
		// validation error
		errorTitle = i18n.t("common.dialogs.validation-error-title");
		errorMsg = (
			<ul>
				{Object.entries(e).map(([key, value]) => (
					<li key={key}>{value}</li>
				))}
			</ul>
		);
	}
	return new Promise((resolve) => {
		pushDialog(
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
		);
	});
};
