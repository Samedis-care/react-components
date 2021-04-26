import React from "react";
import "../../../i18n";
import GroupBox from "../../../standalone/GroupBox/index";
import { text, boolean } from "@storybook/addon-knobs";

export const GroupBoxStory = (): React.ReactElement => {
	return (
		<GroupBox
			smallLabel={boolean("small label", true)}
			label={text("Label Text", "Group Box")}
		>
			<ul>
				<li>Item 1</li>
				<li>Item 2</li>
			</ul>
		</GroupBox>
	);
};

GroupBoxStory.storyName = "GroupBox";
