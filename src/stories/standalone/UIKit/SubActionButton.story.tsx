import React from "react";
import { boolean, text } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import { SubActionButton } from "../../../standalone";
import { MenuBook, Info, PeopleAlt, DeleteForever } from "@material-ui/icons";

export const SubActionButtonStory = (): React.ReactElement => {
	return (
		<>
			<div>
				<SubActionButton
					onClick={action("onClick")}
					disabled={boolean("Disabled", false)}
					small={true}
					icon={<Info />}
				>
					{text("Small SubAction 2 Button Text", "View Information")}
				</SubActionButton>
				<SubActionButton
					onClick={action("onClick")}
					disabled={boolean("Disabled", false)}
					small={true}
					icon={<MenuBook />}
				>
					{text("Small SubAction 1 Button Text", "Open Book")}
				</SubActionButton>
				<SubActionButton
					onClick={action("onClick")}
					disabled={boolean("Disabled", false)}
					small={true}
					icon={<PeopleAlt />}
				>
					{text("Small SubAction 3 Button Text", "List Persons")}
				</SubActionButton>
				<SubActionButton
					onClick={action("onClick")}
					disabled={boolean("Disabled", false)}
					small={true}
					icon={<DeleteForever />}
				>
					{text("Small SubAction 4 Button Text", "Delete Device")}
				</SubActionButton>
			</div>
			<br />
			<div>
				<SubActionButton
					onClick={action("onClick")}
					disabled={boolean("Disabled", false)}
					icon={<MenuBook />}
					disableDivider
				>
					{text("SubAction 1 Button Text", "Open Book")}
				</SubActionButton>
				<SubActionButton
					onClick={action("onClick")}
					disabled={boolean("Disabled", false)}
					icon={<Info />}
				>
					{text("SubAction 2 Button Text", "View Information")}
				</SubActionButton>
				<SubActionButton
					onClick={action("onClick")}
					disabled={boolean("Disabled", false)}
					icon={<PeopleAlt />}
				>
					{text("SubAction 3 Button Text", "List Persons")}
				</SubActionButton>
				<SubActionButton
					onClick={action("onClick")}
					disabled={boolean("Disabled", false)}
					icon={<DeleteForever />}
				>
					{text("SubAction 4 Button Text", "Delete Device")}
				</SubActionButton>
			</div>
		</>
	);
};

SubActionButtonStory.storyName = "SubActionButton";
