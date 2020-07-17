import React, { useContext } from "react";
import { DialogContext } from "../../framework";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@material-ui/core";
import { IDialogConfigForm } from "./Types";

export const FormDialog = React.memo((props: IDialogConfigForm) => {
	const [, setDialog] = useContext(DialogContext)!;
	const { onClose } = props;

	const removeDialog =
		onClose &&
		React.useCallback(() => {
			setDialog(null);
			onClose();
		}, [setDialog, onClose]);

	return (
		<Dialog open={true} onClose={removeDialog}>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<DialogContentText>{props.message}</DialogContentText>
				<>{props.inputs}</>
			</DialogContent>
			<DialogActions>
				{props.buttons.map((btn, index) => (
					<Button
						key={index}
						onClick={() => {
							setDialog(null);
							if (btn.onClick) btn.onClick();
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
});
