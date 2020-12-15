import React from "react";
import { boolean, select, text, withKnobs } from "@storybook/addon-knobs";
import { action, withActions } from "@storybook/addon-actions";
import { ActionButton } from "../../../standalone";
import { Add, ChevronRight } from "@material-ui/icons";

export const ActionButtonStory = (): React.ReactElement => {
	const iconType: string = select(
		"Icon",
		{
			None: "",
			Chevron: "ChevronRight",
			Add: "Add",
		},
		""
	);

	let icon: React.ReactNode = undefined;
	if (iconType === "ChevronRight") {
		icon = <ChevronRight />;
	} else if (iconType === "Add") {
		icon = <Add />;
	}

	return (
		<ActionButton
			onClick={action("onClick")}
			disabled={boolean("Disabled", false)}
			small={boolean("Small button", false)}
			icon={icon}
		>
			{text("Button Text", "Example Text")}
		</ActionButton>
	);
};

ActionButtonStory.storyName = "ActionButton";
ActionButtonStory.decorators = [withActions, withKnobs];
