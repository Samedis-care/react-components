import React, { useState } from "react";
import { boolean, text } from "@storybook/addon-knobs";
import IntegerInputField from "../../../../standalone/UIKit/InputControls/IntegerInputField";
import { action } from "@storybook/addon-actions";
import { useDialogContext } from "../../../../framework";
import { showInfoDialog } from "../../../../non-standalone/Dialog";

export const IntegerInputFieldStory = (): React.ReactElement => {
	const [value, setValue] = useState<number | null>(null);
	const [pushDialog] = useDialogContext();
	const dialogTitle = text("Dialog title", "Sample title");
	const infoText = text(
		"Info Text",
		"This is a pretty long info text which supports html. It really is.<br> It explains you what to write in here."
	);
	const dialogButtonLabel = text("Dialog button label", "Ok");
	const dialogButtonClick = action("onClose");

	return (
		<IntegerInputField
			label={text("Label", "Number Integer Input")}
			placeholder={text("Placeholder", "Enter integer number")}
			fullWidth={boolean("Full Width", true)}
			disabled={boolean("Disable", false)}
			value={value}
			onChange={(evt: React.ChangeEvent, value: number | null) => {
				action("onChange")(evt, value);
				setValue(value);
			}}
			autoFocus={true}
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

IntegerInputFieldStory.storyName = "IntegerInputField";
