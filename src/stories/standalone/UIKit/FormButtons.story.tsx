import React from "react";
import { boolean, select, text } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import { FormButtons, ActionButton } from "../../../standalone";
import {
	Save,
	Cancel,
	Block as BlockIcon,
	Delete as DeleteIcon,
} from "@material-ui/icons";

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
				disabled={boolean("Disabled Text-Only", false)}
				fullWidth={false}
			>
				{text("Button Text-Only Text", "Text-Only")}
			</ActionButton>
			<ActionButton
				onClick={action("onClick")}
				fullWidth={false}
				color="primary"
			>
				Primary Color
			</ActionButton>
			<ActionButton
				onClick={action("onClick")}
				fullWidth={false}
				color="secondary"
			>
				Secondary Color
			</ActionButton>
			<ActionButton
				onClick={action("onClick")}
				fullWidth={false}
				icon={<DeleteIcon />}
				backgroundColor="rgba(199, 109, 199, .9)"
				textColor="rgba(90, 245, 66, .9)"
			>
				Custom Color
			</ActionButton>
			<ActionButton
				onClick={action("onClick")}
				disabled={boolean("Disabled Block", false)}
				fullWidth={false}
				small={boolean("Small Block button", true)}
				icon={<BlockIcon />}
			>
				{text("Button Block Text", "Block")}
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
			<ActionButton
				onClick={action("onClick")}
				disabled={boolean("Disabled Delete", true)}
				fullWidth={false}
				small={boolean("Small Delete button", true)}
				icon={<DeleteIcon />}
			>
				{text("Button Delete Text", "Delete")}
			</ActionButton>
		</FormButtons>
	);
};

FormButtonsStory.storyName = "FormButtons";
