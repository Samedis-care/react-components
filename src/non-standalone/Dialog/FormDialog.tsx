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

const FormDialogRaw = (props: IDialogConfigForm) => {
	const dialogCtx = useContext(DialogContext);
	if (!dialogCtx)
		throw new Error(
			"Dialog Context not set! Did you forget adding the Components-Care Framework or DialogContextProvider?"
		);
	const [, setDialog] = dialogCtx;
	const { onClose } = props;

	const removeDialog = React.useCallback(() => {
		setDialog(null);
		if (onClose) onClose();
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
};

export const FormDialog = React.memo(FormDialogRaw);
