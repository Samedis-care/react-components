import React from "react";
import "../../../i18n";
import GroupBox from "../../../standalone/GroupBox/index";
import { text, withKnobs } from "@storybook/addon-knobs";
import { withActions } from "@storybook/addon-actions";

export const GroupBoxStory = (): React.ReactElement => {
	return (
		<GroupBox label={text("Label Text", "Group Box")}>
			<ul>
				<li>Item 1</li>
				<li>Item 2</li>
			</ul>
		</GroupBox>
	);
};

GroupBoxStory.storyName = "GroupBox";
GroupBoxStory.decorators = [withActions, withKnobs];
