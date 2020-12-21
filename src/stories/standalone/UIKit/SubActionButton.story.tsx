import React from "react";
import { boolean, text, withKnobs } from "@storybook/addon-knobs";
import { action, withActions } from "@storybook/addon-actions";
import { SubActionButton } from "../../../standalone";
import { MenuBook, Info, PeopleAlt, DeleteForever } from "@material-ui/icons";

export const SubActionButtonStory = (): React.ReactElement => {
	return (
		<>
			<SubActionButton
				onClick={action("onClick")}
				disabled={boolean("Disabled", false)}
				small={boolean("Small button", false)}
				icon={<MenuBook />}
			>
				{text("SubAction 1 Button Text", "Open Book")}
			</SubActionButton>
			<SubActionButton
				onClick={action("onClick")}
				disabled={boolean("Disabled", false)}
				small={boolean("Small button", false)}
				icon={<Info />}
			>
				{text("SubAction 2 Button Text", "View Information")}
			</SubActionButton>
			<SubActionButton
				onClick={action("onClick")}
				disabled={boolean("Disabled", false)}
				small={boolean("Small button", false)}
				icon={<PeopleAlt />}
			>
				{text("SubAction 3 Button Text", "List Persons")}
			</SubActionButton>
			<SubActionButton
				onClick={action("onClick")}
				disabled={boolean("Disabled", false)}
				small={boolean("Small button", false)}
				icon={<DeleteForever />}
			>
				{text("SubAction 4 Button Text", "Delete Device")}
			</SubActionButton>
		</>
	);
};

SubActionButtonStory.storyName = "SubActionButton";
SubActionButtonStory.decorators = [withActions, withKnobs];
