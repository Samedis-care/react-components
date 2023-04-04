import React from "react";
import { makeStyles } from "@material-ui/core";
import "../../../i18n";
import { PortalLayout } from "../../../standalone/Portal";
import { boolean, number } from "@storybook/addon-knobs";
var useStyles = makeStyles({
    header: {
        width: "100%",
        height: "100%",
        backgroundColor: "red",
    },
    menu: {
        width: "100%",
        height: "100%",
        color: "white",
        backgroundColor: "blue",
    },
    content: {
        width: "100%",
        height: "100%",
        backgroundColor: "green",
    },
    topLeft: {
        width: "100%",
        height: "100%",
        backgroundColor: "yellow",
    },
}, { name: "CcLayoutStory" });
var Placeholder = function (props) {
    var cssClass = props.cssClass;
    var classes = useStyles();
    return React.createElement("div", { className: classes[cssClass] }, cssClass);
};
export var PortalLayoutStory = function () {
    return (React.createElement(React.Fragment, null,
        React.createElement("style", { dangerouslySetInnerHTML: {
                __html: "\n\t\t\t\thtml, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; }\t\t\t\n\t\t\t",
            } }),
        React.createElement(PortalLayout, { variant: "basic", topLeft: React.createElement(Placeholder, { cssClass: "topLeft" }), headerContent: React.createElement(Placeholder, { cssClass: "header" }), menuContent: React.createElement(Placeholder, { cssClass: "menu" }), content: React.createElement(Placeholder, { cssClass: "content" }), drawerWidth: number("Menu width", 320), collapseMenu: boolean("Collapse menu", false) })));
};
PortalLayoutStory.storyName = "Layout";
