import React, {
	ChangeEvent,
	useCallback,
	useContext,
	useId,
	useRef,
	useState,
} from "react";
import { IDialogConfigInput } from "./Types";
import { PushedDialogCloseContext } from "../../framework/PushedDialogCloseContext";
import useCCTranslations from "../../utils/useCCTranslations";
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
	const {
		onClose,
		handlerButtonNo,
		handlerButtonYes,
		textFieldValidator,
		textFieldErrorText,
	} = props;
	const { t } = useCCTranslations();
	// not useCloseThisDialog, which throws: rendered without pushDialog (or in a
	// FullFormDialog's content, pushed: false), the dialog closes through onClose and the
	// button handlers
	const pushedClose = useContext(PushedDialogCloseContext);
	const closeThisDialog = pushedClose?.pushed ? pushedClose.close : null;
	const [valid, setValid] = useState(true);
	const [value, setValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
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
		closeThisDialog?.();
		if (onClose) onClose();
	}, [closeThisDialog, onClose]);

	const handleNo = React.useCallback(() => {
		closeThisDialog?.();
		handlerButtonNo();
	}, [closeThisDialog, handlerButtonNo]);

	const handleYes = React.useCallback(() => {
		if (textFieldValidator(value)) {
			closeThisDialog?.();
			handlerButtonYes(value);
		} else {
			setValid(false);
			// the field's description says what is wrong: focusing the field reads it out
			inputRef.current?.focus();
		}
	}, [value, handlerButtonYes, textFieldValidator, closeThisDialog, setValid]);

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
					inputRef={inputRef}
					error={!valid}
					helperText={
						valid
							? undefined
							: textFieldErrorText ||
								t("non-standalone.dialog.input-dialog.invalid")
					}
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

/**
 * Text prompt with a title, a message, a text field and the buttons `textButtonNo` and
 * `textButtonYes`. Show it with `pushDialog(<InputDialog … />)`, or use `showInputDialog`.
 *
 * Yes, once `textFieldValidator` accepts the value, closes the dialog and calls
 * `handlerButtonYes`. While the validator rejects the value, the field is marked invalid
 * and described by `textFieldErrorText`, and Yes moves focus to the field instead.
 * No closes it and calls `handlerButtonNo`; Escape and a backdrop click
 * close it and call `onClose`. It closes the dialog it was pushed in, and only that one, also
 * when dialogs were pushed after it. Rendered without pushDialog, it is always open: it closes
 * through `onClose` and the button handlers, which have to stop rendering it.
 */
export const InputDialog = React.memo(InputDialogRaw);
