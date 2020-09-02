import React, { useContext, useEffect } from "react";
import { button, text, withKnobs } from "@storybook/addon-knobs";
import {
	Framework,
	DialogContext,
	ConfirmDialog,
	showConfirmDialog,
} from "../../..";
import { action } from "@storybook/addon-actions";

const Settings = {
	title: "Non-Standalone/Dialog",
	component: ConfirmDialog,
	decorators: [withKnobs],
};
export default Settings;

const DialogContent = () => {
	const ctx = useContext(DialogContext)!;
	const [, setDialog] = ctx;

	const title = text("Title", "Storybook");
	const message = text("Message", "Enter your own text in Knobs!");
	const onClose = action("onClose");
	const yesLabel = text("Yes Button Label", "Yes");
	const yesAction = action("Yes Button onClick");
	const noLabel = text("No Button Label", "No");
	const noAction = action("No Button onClick");

	const openDialog = () => {
		setDialog(
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
		showConfirmDialog(ctx, {
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

export const ConfirmDialogStory = () => {
	return (
		<Framework>
			<DialogContent />
		</Framework>
	);
};

ConfirmDialogStory.story = {
	name: "Confirm",
};
