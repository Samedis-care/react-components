import React, { ChangeEvent, useCallback, useContext, useState } from "react";
import { IDialogConfigInput } from "./Types";
import { DialogContext } from "../../framework";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	TextField,
} from "@material-ui/core";

export const InputDialog = React.memo((props: IDialogConfigInput) => {
	const [, setDialog] = useContext(DialogContext)!;
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

	const removeDialog =
		onClose &&
		React.useCallback(() => {
			setDialog(null);
			onClose();
		}, [setDialog, onClose]);

	const handleNo = React.useCallback(() => {
		setDialog(null);
		handlerButtonNo();
	}, [setDialog, handlerButtonNo]);

	const handleYes = React.useCallback(() => {
		if (textFieldValidator(value)) {
			setDialog(null);
			handlerButtonYes(value);
		} else {
			setValid(false);
		}
	}, [value, handlerButtonYes, textFieldValidator, setDialog, setValid]);

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
});
