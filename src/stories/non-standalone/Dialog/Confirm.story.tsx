import React, { useEffect } from "react";
import { button, text, withKnobs } from "@storybook/addon-knobs";
import { action, withActions } from "@storybook/addon-actions";
import { useDialogContext } from "../../../framework";
import { ConfirmDialog, showConfirmDialog } from "../../../non-standalone";

const DialogContent = (): React.ReactElement => {
	const [pushDialog] = useDialogContext();

	const title = text("Title", "Storybook");
	const message = text("Message", "Enter your own text in Knobs!");
	const onClose = action("onClose");
	const yesLabel = text("Yes Button Label", "Yes");
	const yesAction = action("Yes Button onClick");
	const noLabel = text("No Button Label", "No");
	const noAction = action("No Button onClick");

	const openDialog = () => {
		pushDialog(
			<ConfirmDialog
				title={title}
				message={message}
				onClose={onClose}
				textButtonYes={yesLabel}
				handlerButtonYes={yesAction}
				textButtonNo={noLabel}
				handlerButtonNo={noAction}
			/>
		);
	};

	const openDialogAsync = () => {
		showConfirmDialog(pushDialog, {
			title,
			message,
			textButtonYes: yesLabel,
			textButtonNo: noLabel,
		})
			.then(action("openDialogAsync resolved"))
			.catch(action("openDialogAsync rejected"));
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(openDialog, []);
	button("Open Dialog (sync)", openDialog);
	button("Open Dialog (async)", openDialogAsync);

	return <></>;
};

export const ConfirmDialogStory = (): React.ReactElement => {
	return <DialogContent />;
};

ConfirmDialogStory.storyName = "Confirm";
ConfirmDialogStory.decorators = [withActions, withKnobs];
