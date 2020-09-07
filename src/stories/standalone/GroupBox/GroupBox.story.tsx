import React from "react";
import "../../../i18n";
import GroupBox from "../../../standalone/GroupBox/index";
import { text, withKnobs } from "@storybook/addon-knobs";

const Settings = {
	title: "Standalone/GroupBox",
	component: GroupBox,
	decorators: [withKnobs],
};
export default Settings;

export const GroupBoxStory = () => {
	return (
    <GroupBox 
      id="group-box-story"
      label={text("Label Text", "Group Box")}
    >
      <ul>
        <li>{text("List Item 1", "Item 1")}</li>
        <li>{text("List Item 2", "Item 2")}</li>
      </ul>
    </GroupBox>
	);
};

GroupBoxStory.story = {
	name: "GroupBox",
};
