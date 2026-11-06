import React, { useId } from "react";
import { useDialogContext } from "../../framework";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";
import { IDialogConfigForm } from "./Types";

const FormDialogRaw = (props: IDialogConfigForm) => {
	const [, popDialog] = useDialogContext();
	const { onClose } = props;
	// the message is the dialog's description
	const messageId = useId();

	const removeDialog = React.useCallback(() => {
		popDialog();
		if (onClose) onClose();
	}, [popDialog, onClose]);

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
							if (!btn.dontClose) popDialog();
							if (btn.onClick) await btn.onClick(onClose);
							if (!btn.dontClose && onClose) onClose();
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

export const FormDialog = React.memo(FormDialogRaw);
