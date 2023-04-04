import React from "react";
import { Loader } from "../../../standalone";
import { text } from "@storybook/addon-knobs";
export var LoaderStory = function () {
    return (React.createElement(React.Fragment, null,
        React.createElement("style", { dangerouslySetInnerHTML: {
                __html: "\n\t\t\t\thtml, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; }\t\t\t\n\t\t\t",
            } }),
        React.createElement(Loader, { text: text("Status", "") })));
};
LoaderStory.storyName = "Loader";
