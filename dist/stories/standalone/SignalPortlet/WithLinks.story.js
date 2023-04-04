import React from "react";
import SignalPortlet from "../../../standalone/SignalPortlet";
import { Typography, useTheme } from "@material-ui/core";
export var SignalPortletWithLinksStory = function () {
    var theme = useTheme();
    return (React.createElement(SignalPortlet, { title: React.createElement(Typography, { variant: "h5" }, "Storys"), items: [
            {
                count: 123,
                text: "Many",
                link: "/many",
            },
            {
                count: 0,
                text: "None",
                link: "/none",
            },
            {
                count: 3,
                text: "Some",
                link: "/some",
            },
            {
                count: 1,
                text: "Item without link",
            },
        ], colorPresent: theme.palette.primary.main, colorNotPresent: theme.palette.grey[500] }));
};
SignalPortletWithLinksStory.storyName = "With Links";
