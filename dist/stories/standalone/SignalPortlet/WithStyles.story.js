import React from "react";
import SignalPortlet from "../../../standalone/SignalPortlet";
import { Typography, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
var useManyStyles = makeStyles(function (theme) { return ({
    root: {
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.getContrastText(theme.palette.secondary.main),
    },
}); }, { name: "CcSignalPortletWithStyleStory" });
export var SignalPortletWithStylesStory = function () {
    var theme = useTheme();
    var manyClasses = useManyStyles();
    return (React.createElement(SignalPortlet, { title: React.createElement(Typography, { variant: "h5" }, "Storys"), items: [
            {
                count: 123,
                text: "Many (Styled)",
                classes: manyClasses,
            },
            {
                count: 0,
                text: "None",
            },
            {
                count: 3,
                text: "Some",
            },
        ], colorPresent: theme.palette.primary.main, colorNotPresent: theme.palette.grey[500] }));
};
SignalPortletWithStylesStory.storyName = "With Styles";
