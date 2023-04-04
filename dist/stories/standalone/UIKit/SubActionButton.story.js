import React from "react";
import { boolean, text } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import { SubActionButton } from "../../../standalone";
import { MenuBook, Info, PeopleAlt, DeleteForever } from "@material-ui/icons";
export var SubActionButtonStory = function () {
    return (React.createElement(React.Fragment, null,
        React.createElement("div", null,
            React.createElement(SubActionButton, { onClick: action("onClick"), disabled: boolean("Disabled", false), small: true, icon: React.createElement(Info, null) }, text("Small SubAction 2 Button Text", "View Information")),
            React.createElement(SubActionButton, { onClick: action("onClick"), disabled: boolean("Disabled", false), small: true, icon: React.createElement(MenuBook, null) }, text("Small SubAction 1 Button Text", "Open Book")),
            React.createElement(SubActionButton, { onClick: action("onClick"), disabled: boolean("Disabled", false), small: true, icon: React.createElement(PeopleAlt, null) }, text("Small SubAction 3 Button Text", "List Persons")),
            React.createElement(SubActionButton, { onClick: action("onClick"), disabled: boolean("Disabled", false), small: true, icon: React.createElement(DeleteForever, null) }, text("Small SubAction 4 Button Text", "Delete Device"))),
        React.createElement("br", null),
        React.createElement("div", null,
            React.createElement(SubActionButton, { onClick: action("onClick"), disabled: boolean("Disabled", false), icon: React.createElement(MenuBook, null), disableDivider: true }, text("SubAction 1 Button Text", "Open Book")),
            React.createElement(SubActionButton, { onClick: action("onClick"), disabled: boolean("Disabled", false), icon: React.createElement(Info, null) }, text("SubAction 2 Button Text", "View Information")),
            React.createElement(SubActionButton, { onClick: action("onClick"), disabled: boolean("Disabled", false), icon: React.createElement(PeopleAlt, null) }, text("SubAction 3 Button Text", "List Persons")),
            React.createElement(SubActionButton, { onClick: action("onClick"), disabled: boolean("Disabled", false), icon: React.createElement(DeleteForever, null) }, text("SubAction 4 Button Text", "Delete Device")))));
};
SubActionButtonStory.storyName = "SubActionButton";
