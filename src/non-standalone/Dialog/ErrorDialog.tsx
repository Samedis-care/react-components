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
import { IDialogConfigSimple } from "./Types";

const ErrorDialogRaw = (props: IDialogConfigSimple) => {
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
			</DialogContent>
			<DialogActions>
				{props.buttons.map((data, index) => (
					<Button
						key={index}
						onClick={() => {
							setDialog(null);
							if (data.onClick) data.onClick();
						}}
						color="primary"
						autoFocus={data.autoFocus}
					>
						{data.text}
					</Button>
				))}
			</DialogActions>
		</Dialog>
	);
};

export const ErrorDialog = React.memo(ErrorDialogRaw);
