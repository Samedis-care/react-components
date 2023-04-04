import React from "react";
import { boolean, select, text } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import { ActionButton } from "../../../standalone";
import { Add, ChevronRight } from "@material-ui/icons";
export var ActionButtonStory = function () {
    var iconType = select("Icon", {
        None: "",
        Chevron: "ChevronRight",
        Add: "Add",
    }, "");
    var icon = undefined;
    if (iconType === "ChevronRight") {
        icon = React.createElement(ChevronRight, null);
    }
    else if (iconType === "Add") {
        icon = React.createElement(Add, null);
    }
    return (React.createElement(ActionButton, { onClick: action("onClick"), disabled: boolean("Disabled", false), small: boolean("Small button", false), icon: icon }, text("Button Text", "Example Text")));
};
ActionButtonStory.storyName = "ActionButton";
