import React, { useEffect } from "react";
import { button, text, withKnobs } from "@storybook/addon-knobs";
import {
	Framework,
	InputDialog,
	showInputDialog,
	useDialogContext,
} from "../../..";
import { action, withActions } from "@storybook/addon-actions";

const DialogContent = (): React.ReactElement => {
	const [pushDialog] = useDialogContext();

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
		pushDialog(
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
		showInputDialog(pushDialog, {
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

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(openDialog, []);
	button("Open Dialog (sync)", openDialog);
	button("Open Dialog (async)", openDialogAsync);

	return <></>;
};

export const InputDialogStory = (): React.ReactElement => {
	return (
		<Framework>
			<DialogContent />
		</Framework>
	);
};

InputDialogStory.storyName = "Input";
InputDialogStory.decorators = [withActions, withKnobs];
