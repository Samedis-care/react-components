import React from "react";
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

	const removeDialog = React.useCallback(() => {
		popDialog();
		if (onClose) onClose();
	}, [popDialog, onClose]);

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
						onClick={async () => {
							if (!btn.dontClose) removeDialog();
							if (btn.onClick) await btn.onClick(removeDialog);
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
