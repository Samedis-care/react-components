import React from "react";
import { DialogContextType } from "../../framework";
import { IDialogConfigConfirmAsync, IDialogConfigInputAsync } from "./Types";
import { ConfirmDialog } from "./ConfirmDialog";
import { InputDialog } from "./InputDialog";

/**
 * Shows an awaitable confirm dialog
 * @param ctx The dialog context (useContext(DialogContext))
 * @param props The dialog properties
 * @returns Awaitable promise, resolves if user clicks Yes, rejects otherwise
 */
export const showConfirmDialog = async (
	ctx: DialogContextType,
	props: IDialogConfigConfirmAsync
): Promise<void> => {
	const [, setDialog] = ctx;
	return new Promise((resolve, reject) => {
		setDialog(
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
 * @param ctx The dialog context (useContext(DialogContext))
 * @param props The dialog properties
 * @returns Awaitable promise, resolves if user clicks Yes, rejects otherwise
 */
export const showInputDialog = async (
	ctx: DialogContextType,
	props: IDialogConfigInputAsync
): Promise<string> => {
	const [, setDialog] = ctx;
	return new Promise((resolve, reject) => {
		setDialog(
			<InputDialog
				{...props}
				onClose={reject}
				handlerButtonYes={resolve}
				handlerButtonNo={reject}
			/>
		);
	});
};
