import React from "react";
import { FilterIcon } from "../../../standalone";
import { action } from "@storybook/addon-actions";
import { text } from "@storybook/addon-knobs";
import { Grid } from "@material-ui/core";
import IconButtonWithText from "../../../standalone/UIKit/IconButtonWithText";
var IconButtonProps = {
    color: "primary",
};
var IconButtonIcon = React.createElement(FilterIcon, null);
export var IconButtonWithTextStory = function () {
    return (React.createElement(Grid, { container: true },
        React.createElement(Grid, { item: true }, "Precontent"),
        React.createElement(Grid, { item: true },
            React.createElement(IconButtonWithText, { IconButtonProps: IconButtonProps, icon: IconButtonIcon, text: text("Text", "Filter"), onClick: action("onClick") })),
        React.createElement(Grid, { item: true }, "Post content")));
};
IconButtonWithTextStory.storyName = "IconButtonWithText";
