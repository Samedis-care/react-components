import React from "react";
import { action } from "@storybook/addon-actions";
import { select, text, boolean } from "@storybook/addon-knobs";
import { Grid, IconButton } from "@material-ui/core";
import { ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon, ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon, } from "@material-ui/icons";
import ComponentWithLabel from "../../../standalone/UIKit/ComponentWithLabel";
var labelPlacementValues = [
    "end",
    "start",
    "top",
    "bottom",
];
export var ComponentWithLabelStory = function () {
    return (React.createElement(Grid, { container: true, justify: "center", spacing: 2, alignItems: "center" },
        React.createElement(Grid, { item: true },
            React.createElement(ComponentWithLabel, { disabled: boolean("label left disabled state", true), labelPlacement: select("labelPlacement left", labelPlacementValues, "start"), control: React.createElement(IconButton, { onClick: action("onClick"), color: "primary" },
                    React.createElement(ArrowBackIcon, null)), labelText: text("labelText left", "I am a label\nat the start\nwith as many\nlines to display\nas you want\nand even\nsome more\nset it to\ndisabled if needed") })),
        React.createElement(Grid, { item: true },
            React.createElement(Grid, { container: true, direction: "column", alignItems: "center" },
                React.createElement(Grid, { item: true },
                    React.createElement(ComponentWithLabel, { labelPlacement: select("labelPlacement top", labelPlacementValues, "top"), control: React.createElement(IconButton, { onClick: action("onClick"), color: "secondary" },
                            React.createElement(ArrowUpwardIcon, null)), labelText: text("labelText top", "I am a label\nat the top") })),
                React.createElement(Grid, { item: true },
                    React.createElement(ComponentWithLabel, { labelPlacement: select("labelPlacement bottom", labelPlacementValues, "bottom"), control: React.createElement(IconButton, { onClick: action("onClick"), color: "secondary" },
                            React.createElement(ArrowDownwardIcon, null)), labelText: text("labelText bottom", "I am a label\nat the bottom") })))),
        React.createElement("br", null),
        React.createElement(Grid, { item: true },
            React.createElement(ComponentWithLabel, { labelPlacement: select("labelPlacement right", labelPlacementValues, "end"), control: React.createElement(IconButton, { onClick: action("onClick"), color: "primary" },
                    React.createElement(ArrowForwardIcon, null)), labelText: text("labelText right", "I am a label\nat the end.\nClicking the label\nwill forward the\nclick to\nthe control\nwhich can be\nany Button\nor Form element") }))));
};
ComponentWithLabelStory.storyName = "ComponentWithLabel";
