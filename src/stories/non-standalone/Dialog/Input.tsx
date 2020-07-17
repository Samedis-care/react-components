import React, { useContext, useEffect } from "react";
import { button, text, withKnobs } from "@storybook/addon-knobs";
import {
	Framework,
	DialogContext,
	InputDialog,
	showInputDialog,
} from "../../..";
import { action } from "@storybook/addon-actions";

export default {
	title: "Non-Standalone/Dialog",
	component: InputDialog,
	decorators: [withKnobs],
};

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
	const textFieldLabel = text("Text Field Label", "Enter your input here:");
	const validate = () => true;

	const openDialog = () => {
		setDialog(
			<InputDialog
				title={title}
				message={message}
				onClose={onClose}
				textButtonYes={yesLabel}
				handlerButtonYes={yesAction}
				textButtonNo={noLabel}
				handlerButtonNo={noAction}
				textFieldLabel={textFieldLabel}
				textFieldValidator={validate}
			/>
		);
	};

	const openDialogAsync = () => {
		showInputDialog(ctx, {
			title,
			message,
			textButtonYes: yesLabel,
			textButtonNo: noLabel,
			textFieldLabel,
			textFieldValidator: validate,
		})
			.then(action("openDialogAsync resolved"))
			.catch(action("openDialogAsync rejected"));
	};

	useEffect(openDialog, []);
	button("Open Dialog (sync)", openDialog);
	button("Open Dialog (async)", openDialogAsync);

	return <></>;
};

export const InputDialogStory = () => {
	return (
		<Framework>
			<DialogContent />
		</Framework>
	);
};

InputDialogStory.story = {
	name: "Input",
};
