import React from "react";
import { boolean, select, text } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import { InfoBox } from "../../../standalone";
export var InfoBoxStory = function () {
    return (React.createElement(InfoBox, { heading: text("Heading", "Heading"), message: text("Message", "Message"), expanded: boolean("Expanded by default?", false), alwaysExpanded: boolean("Enable always expanded?", false)
            ? boolean("Always expanded", true)
            : undefined, onChange: action("onChange"), status: select("Select status", ["info", "warning", "success", "error"], "info") }));
};
InfoBoxStory.storyName = "InfoBox";
