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
import { IDialogConfigSimple } from "./Types";
import useRefState from "../../utils/useRefState";
import { dialogButtonClose } from "./dialogButtonClose";

const ErrorDialogRaw = (props: IDialogConfigSimple) => {
	const { onClose } = props;
	// not useCloseThisDialog, which throws: rendered without pushDialog (or in a
	// FullFormDialog's content, pushed: false), the dialog closes through onClose
	const pushedClose = useContext(PushedDialogCloseContext);
	const closeThisDialog = pushedClose?.pushed ? pushedClose.close : null;
	// pending state of an async button handler. the ref part guards against a
	// second click landing before the re-render which disables the buttons.
	const {
		get: getBusy,
		set: setBusy,
		state: busy,
	} = useRefState<boolean>(false);
	// the message is the dialog's description
	const messageId = useId();

	const removeDialog = React.useCallback(() => {
		closeThisDialog?.();
		if (onClose) onClose();
	}, [closeThisDialog, onClose]);

	const handleClose = React.useCallback(() => {
		if (getBusy()) return;
		removeDialog();
	}, [getBusy, removeDialog]);

	return (
		<Dialog open={true} onClose={handleClose} aria-describedby={messageId}>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<DialogContentText component={"span"} id={messageId}>
					{props.message}
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				{props.buttons.map((data, index) => (
					<Button
						key={index}
						onClick={async () => {
							if (getBusy()) return;
							const { close, end } = dialogButtonClose(
								closeThisDialog,
								onClose,
							);
							try {
								if (data.onClick) {
									setBusy(true);
									try {
										await data.onClick(close);
									} finally {
										setBusy(false);
									}
								}
							} finally {
								// the handler closed the dialog: report it closed, also when the handler
								// failed, as nothing can close the dialog anymore
								end();
							}
							if (!data.dontClose) close();
						}}
						color={data.color || "primary"}
						autoFocus={data.autoFocus}
						disabled={busy}
					>
						{data.text}
					</Button>
				))}
			</DialogActions>
		</Dialog>
	);
};

/**
 * Message dialog with a title, a message and a row of buttons; InfoDialog and ConfirmDialog
 * render it. Show it with `pushDialog(<ErrorDialog … />)`, or use `showErrorDialog` /
 * `showInfoDialog`.
 *
 * A button runs its `onClick` while the dialog is open (a returned promise is awaited with the
 * buttons disabled and Escape and the backdrop ignored), then, unless `dontClose`, closes the
 * dialog and calls `onClose`. `onClick` gets a `close` that closes the dialog at once, e.g.
 * before navigating; `onClose` is then called once the handler has ended, also with
 * `dontClose`. Escape and a backdrop click close it and call `onClose`.
 * It closes the dialog it was pushed in, and only that one, also when dialogs were pushed
 * after it. Rendered without pushDialog, it is always open: it closes through `onClose`,
 * which has to stop rendering it.
 */
export const ErrorDialog = React.memo(ErrorDialogRaw);
