import React, { useContext, useEffect } from "react";
import { button, number, text, withKnobs } from "@storybook/addon-knobs";
import {
	Framework,
	DialogContext,
	IDialogButtonConfig,
	ErrorDialog,
} from "../../..";
import { action } from "@storybook/addon-actions";

const Settings = {
	title: "Non-Standalone/Dialog",
	component: ErrorDialog,
	decorators: [withKnobs],
};
export default Settings;

const DialogContent = () => {
	const [, setDialog] = useContext(DialogContext)!;

	const title = text("Title", "Storybook");
	const message = text("Message", "Enter your own text in Knobs!");
	const onClose = action("onClose");
	const buttons: IDialogButtonConfig[] = [];
	const buttonCount = number("Button Count", 1, {
		range: true,
		min: 1,
		max: 5,
		step: 1,
	});
	for (let i = 0; i < buttonCount; ++i) {
		buttons.push({
			text: text("Button " + i + " text", "Btn" + i),
			onClick: action("Button " + i + " onClick"),
			autoFocus: i === 0,
		});
	}

	const openDialog = () => {
		setDialog(
			<ErrorDialog
				title={title}
				message={message}
				onClose={onClose}
				buttons={buttons}
			/>
		);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(openDialog, []);
	button("Open Dialog", openDialog);

	return <></>;
};

export const ErrorDialogStory = () => {
	return (
		<Framework>
			<DialogContent />
		</Framework>
	);
};

ErrorDialogStory.story = {
	name: "Error",
};
