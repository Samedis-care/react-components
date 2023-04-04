import React from "react";
import "../../../i18n";
import GroupBox from "../../../standalone/GroupBox/index";
import { text, boolean } from "@storybook/addon-knobs";
export var GroupBoxStory = function () {
    return (React.createElement(GroupBox, { smallLabel: boolean("small label", true), label: text("Label Text", "Group Box") },
        React.createElement("ul", null,
            React.createElement("li", null, "Item 1"),
            React.createElement("li", null, "Item 2"))));
};
GroupBoxStory.storyName = "GroupBox";
