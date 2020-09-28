import React, { ChangeEvent, useCallback, useState } from "react";
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
} from "@material-ui/core";

const InputDialogRaw = (props: IDialogConfigInput) => {
	const [, popDialog] = useDialogContext();
	const {
		onClose,
		handlerButtonNo,
		handlerButtonYes,
		textFieldValidator,
	} = props;
	const [valid, setValid] = useState(true);
	const [value, setValue] = useState("");

	const updateValue = useCallback(
		(evt: ChangeEvent<HTMLInputElement>) => setValue(evt.target.value),
		[setValue]
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
		<Dialog open={true} onClose={removeDialog}>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<DialogContentText>{props.message}</DialogContentText>
				<TextField
					autoFocus
					margin="dense"
					label={props.textFieldLabel}
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
