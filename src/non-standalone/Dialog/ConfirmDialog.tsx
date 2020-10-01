import React from "react";
import { IDialogConfigConfirm } from "./Types";
import { InfoDialog } from "./InfoDialog";

const ConfirmDialogRaw = (props: IDialogConfigConfirm) => (
	<InfoDialog
		title={props.title}
		message={props.message}
		onClose={props.onClose}
		buttons={[
			{
				text: props.textButtonYes,
				onClick: props.handlerButtonYes,
				autoFocus: true,
			},
			{
				text: props.textButtonNo,
				onClick: props.handlerButtonNo,
				autoFocus: false,
				color: "secondary",
			},
		]}
	/>
);

export const ConfirmDialog = React.memo(ConfirmDialogRaw);
