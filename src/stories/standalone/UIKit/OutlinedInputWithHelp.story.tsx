import React from "react";
import { boolean, text } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import { useDialogContext } from "../../../framework";
import { showInfoDialog } from "../../../non-standalone";
import OutlinedInputWithHelp from "../../../standalone/UIKit/OutlinedInputWithHelp";

export const OutlinedInputWithHelpStory = (): React.ReactElement => {
	const [pushDialog] = useDialogContext();
	const dialogTitle = text("Dialog title", "Sample title");
	const infoText = text(
		"Info Text",
		"This is a pretty long info text which supports html. It really is.<br> It explains you what to write in here."
	);
	const dialogButtonLabel = text("Dialog button label", "Ok");
	const dialogButtonClick = action("onClose");

	return (
		<OutlinedInputWithHelp
			placeholder={text("Placeholder", "Enter something here")}
			fullWidth={boolean("100% Width", true)}
			important={boolean("Important", false)}
			openInfo={() =>
				showInfoDialog(pushDialog, {
					title: dialogTitle,
					message: (
						<div
							dangerouslySetInnerHTML={{
								__html: infoText,
							}}
						/>
					),
					buttons: [
						{
							text: dialogButtonLabel,
							onClick: dialogButtonClick,
							autoFocus: true,
							color: "primary",
						},
					],
				})
			}
		/>
	);
};

OutlinedInputWithHelpStory.storyName = "OutlinedInputWithHelp";
