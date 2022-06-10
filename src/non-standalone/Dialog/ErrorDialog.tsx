import React from "react";
import { useDialogContext } from "../../framework";
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
			</DialogContent>
			<DialogActions>
				{props.buttons.map((data, index) => (
					<Button
						key={index}
						onClick={() => {
							if (!data.dontClose) removeDialog();
							if (data.onClick) data.onClick();
						}}
						color={data.color || "primary"}
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
