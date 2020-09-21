import React, { useContext, useEffect } from "react";
import { button, number, text, withKnobs } from "@storybook/addon-knobs";
import {
	Framework,
	InfoDialog,
	DialogContext,
	IDialogButtonConfig,
} from "../../..";
import { action } from "@storybook/addon-actions";

const Settings = {
	title: "Non-Standalone/Dialog",
	component: InfoDialog,
	decorators: [withKnobs],
};
export default Settings;

const DialogContent = (): React.ReactElement => {
	const ctx = useContext(DialogContext);
	if (!ctx)
		throw new Error(
			"DialogContext is missing, did you forget to add Components-Care Framework or DialogContextProvider?"
		);

	const [, setDialog] = ctx;

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
			text: text(`Button ${i} text`, `Btn${i}`),
			onClick: action(`Button ${i} onClick`),
			autoFocus: i === 0,
		});
	}

	const openDialog = () => {
		setDialog(
			<InfoDialog
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

export const InfoDialogStory = (): React.ReactElement => {
	return (
		<Framework>
			<DialogContent />
		</Framework>
	);
};

InfoDialogStory.story = {
	name: "Info",
};
