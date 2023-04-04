import React from "react";
import { boolean, select, text } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import { FormButtons, ActionButton } from "../../../standalone";
import { Save, Cancel, Block as BlockIcon, Delete as DeleteIcon, } from "@material-ui/icons";
export var FormButtonsStory = function () {
    var saveIconType = select("Save Icon", {
        None: "",
        Save: "Save",
        Cancel: "Cancel",
    }, "");
    var cancelIconType = select("Cancel Icon", {
        None: "",
        Save: "Save",
        Cancel: "Cancel",
    }, "");
    var saveIcon = undefined;
    if (saveIconType === "Save") {
        saveIcon = React.createElement(Save, null);
    }
    else if (saveIconType === "Cancel") {
        saveIcon = React.createElement(Cancel, null);
    }
    var cancelIcon = undefined;
    if (cancelIconType === "Save") {
        cancelIcon = React.createElement(Save, null);
    }
    else if (cancelIconType === "Cancel") {
        cancelIcon = React.createElement(Cancel, null);
    }
    return (React.createElement(FormButtons, null,
        React.createElement(ActionButton, { onClick: action("onClick"), disabled: boolean("Disabled Save", false), fullWidth: false, small: boolean("Small Save button", false), icon: saveIcon }, text("Button Save Text", "Save")),
        React.createElement(ActionButton, { onClick: action("onClick"), disabled: boolean("Disabled Text-Only", false), fullWidth: false }, text("Button Text-Only Text", "Text-Only")),
        React.createElement(ActionButton, { onClick: action("onClick"), fullWidth: false, color: "primary" }, "Primary Color"),
        React.createElement(ActionButton, { onClick: action("onClick"), fullWidth: false, color: "secondary" }, "Secondary Color"),
        React.createElement(ActionButton, { onClick: action("onClick"), fullWidth: false, icon: React.createElement(DeleteIcon, null), backgroundColor: "rgba(199, 109, 199, .9)", textColor: "rgba(90, 245, 66, .9)" }, "Custom Color"),
        React.createElement(ActionButton, { onClick: action("onClick"), disabled: boolean("Disabled Block", false), fullWidth: false, small: boolean("Small Block button", true), icon: React.createElement(BlockIcon, null) }, text("Button Block Text", "Block")),
        React.createElement(ActionButton, { onClick: action("onClick"), disabled: boolean("Disabled Cancel", true), fullWidth: false, small: boolean("Small Cancel button", false), icon: cancelIcon }, text("Button Cancel Text", "Cancel")),
        React.createElement(ActionButton, { onClick: action("onClick"), disabled: boolean("Disabled Delete", true), fullWidth: false, small: boolean("Small Delete button", true), icon: React.createElement(DeleteIcon, null) }, text("Button Delete Text", "Delete"))));
};
FormButtonsStory.storyName = "FormButtons";
