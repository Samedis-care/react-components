import React from "react";
import { IDialogConfigConfirm } from "./Types";
import { InfoDialog } from "./InfoDialog";

export const ConfirmDialog = React.memo((props: IDialogConfigConfirm) => (
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
			},
		]}
	/>
));
