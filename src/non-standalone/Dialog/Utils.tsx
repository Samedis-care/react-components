import React from "react";
import { DialogContextType } from "../../framework";
import {
	IDialogConfigConfirmAsync,
	IDialogConfigInputAsync,
	IDialogConfigSimple,
	IDialogConfigSign,
	IDialogConfigImageBox,
} from "./Types";
import { ConfirmDialog } from "./ConfirmDialog";
import { InputDialog } from "./InputDialog";
import { InfoDialog } from "./InfoDialog";
import { SignDialog } from "./SignPadDialog";
import { ImageBoxDialog } from "./ImageDialog";
import i18n from "../../i18n";

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
 */
export const showInfoDialog = (
	pushDialog: DialogContextType[0],
	props: Omit<IDialogConfigSimple, "buttons"> &
		Partial<Pick<IDialogConfigSimple, "buttons">>
): void => {
	const { title, message, buttons } = props;
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
		/>
	);
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
 * Shows image box control dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties for image box
 */
export const showImageDialog = (
	pushDialog: DialogContextType[0],
	props: IDialogConfigImageBox
): void => {
	pushDialog(<ImageBoxDialog {...props} />);
};
