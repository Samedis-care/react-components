import React, { useContext, useId } from "react";
import { PushedDialogCloseContext } from "../../framework/PushedDialogCloseContext";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";
import { IDialogConfigForm } from "./Types";
import { dialogButtonClose } from "./dialogButtonClose";

const FormDialogRaw = (props: IDialogConfigForm) => {
	const { onClose } = props;
	// not useCloseThisDialog, which throws: rendered without pushDialog (or in a
	// FullFormDialog's content, pushed: false), the dialog closes through onClose
	const pushedClose = useContext(PushedDialogCloseContext);
	const closeThisDialog = pushedClose?.pushed ? pushedClose.close : null;
	// the message is the dialog's description
	const messageId = useId();

	const removeDialog = React.useCallback(() => {
		closeThisDialog?.();
		if (onClose) onClose();
	}, [closeThisDialog, onClose]);

	return (
		<Dialog open={true} onClose={removeDialog} aria-describedby={messageId}>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<DialogContentText id={messageId}>{props.message}</DialogContentText>
				<>{props.inputs}</>
			</DialogContent>
			<DialogActions>
				{props.buttons.map((btn, index) => (
					<Button
						key={index}
						onClick={async () => {
							const { close, end } = dialogButtonClose(
								closeThisDialog,
								onClose,
							);
							if (!btn.dontClose) close();
							try {
								if (btn.onClick) await btn.onClick(close);
							} finally {
								// report the close once the handler has ended, also when it failed
								end();
							}
						}}
						color="primary"
						autoFocus={btn.autoFocus}
					>
						{btn.text}
					</Button>
				))}
			</DialogActions>
		</Dialog>
	);
};

/**
 * Message dialog with `inputs` under the message and a row of buttons. Not the model form
 * dialog, which is `FullFormDialog`. Show it with `pushDialog(<FormDialog … />)`.
 *
 * A button closes the dialog (unless `dontClose`), awaits its `onClick`, then calls `onClose`
 * (unless `dontClose`), also when the handler failed. `onClick` gets a `close` that closes the
 * dialog at once; with `dontClose`, `onClose` is then called once the handler has ended.
 * Escape and a backdrop click close it and call `onClose`. It
 * closes the dialog it was pushed in, and only that one, also when dialogs were pushed after
 * it. Rendered without pushDialog, it is always open: it closes through `onClose`, which has
 * to stop rendering it.
 */
export const FormDialog = React.memo(FormDialogRaw);
