import React, { useContext, useId, useMemo } from "react";
import { PushedDialogCloseContext } from "../../framework/PushedDialogCloseContext";
import {
	Button,
	buttonClasses,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";
import { IDialogConfigSimple } from "./Types";
import useRefState from "../../utils/useRefState";
import { dialogButtonClose } from "./dialogButtonClose";

// shown before the label of the button whose handler runs; the button's aria-disabled and
// the dialog's aria-busy tell assistive technology
const busyIndicator = (
	<CircularProgress color="inherit" size={16} aria-hidden />
);

const ErrorDialogRaw = (props: IDialogConfigSimple) => {
	const { onClose } = props;
	// not useCloseThisDialog, which throws: rendered without pushDialog (or in a
	// FullFormDialog's content, pushed: false), the dialog closes through onClose
	const pushedClose = useContext(PushedDialogCloseContext);
	const closeThisDialog = pushedClose?.pushed ? pushedClose.close : null;
	// the index of the button whose async handler runs, null while none runs. the ref part
	// guards against a second click landing before the re-render which disables the buttons.
	const {
		get: getBusyButton,
		set: setBusyButton,
		state: busyButton,
	} = useRefState<number | null>(null);
	const busy = busyButton !== null;
	// the message is the dialog's description
	const messageId = useId();

	const removeDialog = React.useCallback(() => {
		closeThisDialog?.();
		if (onClose) onClose();
	}, [closeThisDialog, onClose]);

	const handleClose = React.useCallback(() => {
		if (getBusyButton() !== null) return;
		removeDialog();
	}, [getBusyButton, removeDialog]);

	const slotProps = useMemo(
		() => ({ paper: { "aria-busy": busy || undefined } }),
		[busy],
	);

	return (
		<Dialog
			open={true}
			onClose={handleClose}
			aria-describedby={messageId}
			slotProps={slotProps}
		>
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
							if (getBusyButton() !== null) return;
							const { close, end } = dialogButtonClose(
								closeThisDialog,
								onClose,
							);
							try {
								if (data.onClick) {
									setBusyButton(index);
									try {
										await data.onClick(close);
									} finally {
										setBusyButton(null);
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
						// while busy the buttons look and act disabled but stay focusable (not
						// `disabled`), so the focused one keeps focus; clicks are ignored above
						aria-disabled={busy || undefined}
						className={busy ? buttonClasses.disabled : undefined}
						startIcon={busyButton === index ? busyIndicator : undefined}
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
 * A button runs its `onClick` while the dialog is open, then, unless `dontClose`, closes the
 * dialog and calls `onClose`. While a returned promise is awaited, the dialog is `aria-busy`,
 * its buttons are `aria-disabled` and ignore clicks, the pressed one shows a progress spinner
 * before its label, and Escape and the backdrop are ignored. The buttons stay focusable, so
 * keyboard focus stays on the pressed button. `onClick` gets a `close` that closes the dialog
 * at once; `onClose` is then called once the handler has ended, also with `dontClose`. Escape
 * and a backdrop click close it and call `onClose`.
 * It closes the dialog it was pushed in, and only that one, also when dialogs were pushed
 * after it. Rendered without pushDialog, it is always open: it closes through `onClose`,
 * which has to stop rendering it.
 */
export const ErrorDialog = React.memo(ErrorDialogRaw);
