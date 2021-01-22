import React from "react";
import { boolean, text } from "@storybook/addon-knobs";
import TextFieldWithHelp from "../../../standalone/UIKit/TextFieldWithHelp";
import { action } from "@storybook/addon-actions";
import { useDialogContext } from "../../../framework";
import { showInfoDialog } from "../../../non-standalone/Dialog";

export const TextFieldWithHelpStory = (): React.ReactElement => {
	const [pushDialog] = useDialogContext();

	return (
		<TextFieldWithHelp
			label={text("Label", "FieldName")}
			placeholder={text("Placeholder", "Enter something here")}
			fullWidth={boolean("100% Width", true)}
			important={boolean("Important", false)}
			openInfo={() =>
				showInfoDialog(pushDialog, {
					title: text("Dialog title", "Sample title"),
					message: (
						<div
							dangerouslySetInnerHTML={{
								__html: text(
									"Info Text",
									"This is a pretty long info text which supports html. It really is.<br> It explains you what to write in here."
								),
							}}
						/>
					),
					buttons: [
						{
							text: text("Dialog button label", "Ok"),
							onClick: action("onClose"),
							autoFocus: true,
							color: "primary",
						},
					],
				})
			}
		/>
	);
};

TextFieldWithHelpStory.storyName = "TextFieldWithHelp";
