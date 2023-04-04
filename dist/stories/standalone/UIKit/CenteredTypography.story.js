import React from "react";
import { CenteredTypography } from "../../../standalone";
export var CenteredTypographyStory = function () {
    return (React.createElement("div", { style: { width: "90vw", height: "100vh" } },
        React.createElement(CenteredTypography, { variant: "h3" }, "This text is centered relatively to its parent element")));
};
CenteredTypographyStory.storyName = "CenteredTypography";
