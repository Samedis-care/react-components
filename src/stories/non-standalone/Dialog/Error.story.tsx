import React, { useEffect } from "react";
import { button, number, text } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import { useDialogContext } from "../../../framework";
import { ErrorDialog, IDialogButtonConfig } from "../../../non-standalone";

const DialogContent = (): React.ReactElement => {
	const [pushDialog] = useDialogContext();

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
		pushDialog(
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

export const ErrorDialogStory = (): React.ReactElement => {
	return <DialogContent />;
};

ErrorDialogStory.storyName = "Error";
