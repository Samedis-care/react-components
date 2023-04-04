import React from "react";
import { List, makeStyles } from "@material-ui/core";
import "../../../i18n";
import { JumboReactLightMenuItem, JumboReactDarkMenuItem, MaterialMenuItem, MenuBase, PortalLayout, CollapsibleMenu, } from "../../../standalone/Portal";
import { Domain, Home } from "@material-ui/icons";
import { boolean, select } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
var useStyles = makeStyles({
    header: {
        width: "100%",
        height: "100%",
        backgroundColor: "red",
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
}, { name: "CcMenuStory" });
var usePortalStyles = makeStyles({
    menuWrapper: {
        backgroundColor: "#252525",
    },
    collapse: {
        color: "#A1A1A1",
    },
    menuChildrenWrapper: {
        backgroundColor: "#1d1d1d",
    },
    toolbar: {
        minHeight: 32,
    },
}, { name: "CcMenuStyleStory" });
var Placeholder = function (props) {
    var cssClass = props.cssClass;
    var classes = useStyles();
    return React.createElement("div", { className: classes[cssClass] }, cssClass);
};
export var PortalMenuStory = function () {
    var variant = select("Variant", {
        Material: "Material",
        JumboLight: "JumboLight",
        JumboDark: "JumboDark",
    }, "Material");
    var collapsible = boolean("Collapsible Menu", true);
    var classes = usePortalStyles();
    var menu = function () { return (React.createElement(MenuBase, { className: variant === "JumboDark" ? classes.menuWrapper : undefined, definition: [
            {
                icon: Home,
                title: "Home Sweet Home Sweet Home",
                onClick: function () { return action("onClick: Home"); },
                shouldRender: true,
            },
            {
                icon: Domain,
                title: "Admin",
                onClick: function () { return action("onClick: Admin"); },
                shouldRender: true,
                children: [
                    {
                        title: "Item 1",
                        onClick: function () { return action("onClick: Admin/Item 1"); },
                        shouldRender: true,
                    },
                    {
                        title: "Item 2",
                        onClick: function () { return action("onClick: Admin/Item 2"); },
                        shouldRender: true,
                    },
                    {
                        title: "Item 3",
                        onClick: function () { return action("onClick: Admin/Item 3"); },
                        shouldRender: true,
                    },
                    {
                        title: "Item 4",
                        onClick: function () { return action("onClick: Admin/Item 4"); },
                        shouldRender: false,
                    },
                ],
            },
        ], wrapper: List, menuItem: variant === "JumboDark"
            ? JumboReactDarkMenuItem
            : variant === "JumboLight"
                ? JumboReactLightMenuItem
                : MaterialMenuItem, childWrapperClassName: variant === "JumboDark" ? classes.menuChildrenWrapper : undefined })); };
    return (React.createElement(React.Fragment, null,
        React.createElement("style", { dangerouslySetInnerHTML: {
                __html: "\n\t\t\t\thtml, body, #root { margin: 0 !important; padding: 0 !important; width: 100%; height: 100%; }\n\t\t\t",
            } }),
        React.createElement(PortalLayout, { variant: collapsible ? "no-top-left" : "basic", headerContent: React.createElement(Placeholder, { cssClass: "header" }), menuContent: collapsible ? (React.createElement(CollapsibleMenu, { customClasses: variant === "JumboDark"
                    ? {
                        root: classes.menuWrapper,
                        button: classes.collapse,
                    }
                    : undefined }, menu())) : (menu()), topLeft: React.createElement(Placeholder, { cssClass: "topLeft" }), content: React.createElement(Placeholder, { cssClass: "content" }), 
            //drawerWidth={collapsible ? undefined : 320}
            customClasses: {
                header: {
                    toolbar: {
                        regular: classes.toolbar,
                    },
                },
            } })));
};
PortalMenuStory.storyName = "Menu";
