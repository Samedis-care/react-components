import React from "react";
import { text } from "@storybook/addon-knobs";
import { HowToBox } from "../../../standalone";
export var HowToBoxStory = function () {
    return (React.createElement(HowToBox
    // optional custom titleLabel
    , { 
        // optional custom titleLabel
        titleLabel: text("Title", "How it works"), 
        // eslint-disable-next-line react/jsx-key
        labels: [React.createElement("b", null, "Important!"), "Less important"] }));
};
HowToBoxStory.storyName = "HowToBox";
