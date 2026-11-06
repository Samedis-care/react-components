import React, { ChangeEvent, useCallback, useId, useState } from "react";
import { IDialogConfigInput } from "./Types";
import { useDialogContext } from "../../framework";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	TextField,
} from "@mui/material";

const InputDialogRaw = (props: IDialogConfigInput) => {
	const [, popDialog] = useDialogContext();
	const { onClose, handlerButtonNo, handlerButtonYes, textFieldValidator } =
		props;
	const [valid, setValid] = useState(true);
	const [value, setValue] = useState("");
	// the message is the dialog's description
	const messageId = useId();

	const updateValue = useCallback(
		(evt: ChangeEvent<HTMLInputElement>) => {
			setValue(evt.target.value);
			setValid(textFieldValidator(evt.target.value));
		},
		[textFieldValidator],
	);

	const removeDialog = React.useCallback(() => {
		popDialog();
		if (onClose) onClose();
	}, [popDialog, onClose]);

	const handleNo = React.useCallback(() => {
		popDialog();
		handlerButtonNo();
	}, [popDialog, handlerButtonNo]);

	const handleYes = React.useCallback(() => {
		if (textFieldValidator(value)) {
			popDialog();
			handlerButtonYes(value);
		} else {
			setValid(false);
		}
	}, [value, handlerButtonYes, textFieldValidator, popDialog, setValid]);

	return (
		<Dialog open={true} onClose={removeDialog} aria-describedby={messageId}>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<DialogContentText id={messageId}>{props.message}</DialogContentText>
				<TextField
					autoFocus
					margin="dense"
					label={props.textFieldLabel}
					placeholder={props.textFieldPlaceholder}
					type="text"
					value={value}
					onChange={updateValue}
					error={!valid}
					fullWidth
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleNo} color="primary">
					{props.textButtonNo}
				</Button>
				<Button onClick={handleYes} color="primary">
					{props.textButtonYes}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export const InputDialog = React.memo(InputDialogRaw);
