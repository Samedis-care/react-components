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
import { IDialogConfigSimple } from "./Types";
import useRefState from "../../utils/useRefState";

const ErrorDialogRaw = (props: IDialogConfigSimple) => {
	const [, popDialog] = useDialogContext();
	const { onClose } = props;
	// pending state of an async button handler. the ref part guards against a
	// second click landing before the re-render which disables the buttons.
	const {
		get: getBusy,
		set: setBusy,
		state: busy,
	} = useRefState<boolean>(false);

	const removeDialog = React.useCallback(() => {
		popDialog();
		if (onClose) onClose();
	}, [popDialog, onClose]);

	const handleClose = React.useCallback(() => {
		if (getBusy()) return;
		removeDialog();
	}, [getBusy, removeDialog]);

	return (
		<Dialog open={true} onClose={handleClose}>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<DialogContentText component={"span"}>
					{props.message}
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				{props.buttons.map((data, index) => (
					<Button
						key={index}
						onClick={async () => {
							if (getBusy()) return;
							if (data.onClick) {
								setBusy(true);
								try {
									await data.onClick(onClose);
								} finally {
									setBusy(false);
								}
							}
							if (!data.dontClose) removeDialog();
						}}
						color={data.color || "primary"}
						autoFocus={data.autoFocus}
						disabled={busy}
					>
						{data.text}
					</Button>
				))}
			</DialogActions>
		</Dialog>
	);
};

export const ErrorDialog = React.memo(ErrorDialogRaw);
