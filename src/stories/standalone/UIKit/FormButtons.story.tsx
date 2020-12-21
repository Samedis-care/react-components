import React from "react";
import { boolean, select, text, withKnobs } from "@storybook/addon-knobs";
import { action, withActions } from "@storybook/addon-actions";
import { FormButtons, ActionButton } from "../../../standalone";
import { Save, Cancel } from "@material-ui/icons";

export const FormButtonsStory = (): React.ReactElement => {
	const saveIconType: string = select(
		"Save Icon",
		{
			None: "",
			Save: "Save",
			Cancel: "Cancel",
		},
		""
	);
	const cancelIconType: string = select(
		"Cancel Icon",
		{
			None: "",
			Save: "Save",
			Cancel: "Cancel",
		},
		""
	);

	let saveIcon: React.ReactNode = undefined;
	if (saveIconType === "Save") {
		saveIcon = <Save />;
	} else if (saveIconType === "Cancel") {
		saveIcon = <Cancel />;
	}

	let cancelIcon: React.ReactNode = undefined;
	if (cancelIconType === "Save") {
		cancelIcon = <Save />;
	} else if (cancelIconType === "Cancel") {
		cancelIcon = <Cancel />;
	}

	return (
		<FormButtons>
			<ActionButton
				onClick={action("onClick")}
				disabled={boolean("Disabled Save", false)}
				fullWidth={false}
				small={boolean("Small Save button", false)}
				icon={saveIcon}
			>
				{text("Button Save Text", "Save")}
			</ActionButton>
			<ActionButton
				onClick={action("onClick")}
				disabled={boolean("Disabled Cancel", true)}
				fullWidth={false}
				small={boolean("Small Cancel button", false)}
				icon={cancelIcon}
			>
				{text("Button Cancel Text", "Cancel")}
			</ActionButton>
		</FormButtons>
	);
};

FormButtonsStory.storyName = "FormButtons";
FormButtonsStory.decorators = [withActions, withKnobs];
