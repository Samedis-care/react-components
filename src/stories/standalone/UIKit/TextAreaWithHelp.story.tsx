import React from "react";
import { boolean, text } from "@storybook/addon-knobs";
import TextFieldWithHelp from "../../../standalone/UIKit/TextFieldWithHelp";
import { action } from "@storybook/addon-actions";
import { useDialogContext } from "../../../framework";
import { showInfoDialog } from "../../../non-standalone";

export const TextAreaWithHelpStory = (): React.ReactElement => {
	const [pushDialog] = useDialogContext();
	const dialogTitle = text("Dialog title", "Sample title");
	const infoText = text(
		"Info Text",
		"This is a pretty long info text which supports html. It really is.<br> It explains you what to write in here."
	);
	const dialogButtonLabel = text("Dialog button label", "Ok");
	const dialogButtonClick = action("onClose");

	return (
		<TextFieldWithHelp
			label={text("Label", "FieldName")}
			placeholder={text("Placeholder", "Enter something here")}
			fullWidth={boolean("100% Width", true)}
			important={boolean("Important", false)}
			variant={"outlined"}
			multiline
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

TextAreaWithHelpStory.storyName = "TextAreaWithHelp";
