import React from "react";
import { List, makeStyles } from "@material-ui/core";
import "../../../i18n";
import { JumboReactDarkMenuItem, JumboReactLightMenuItem, MaterialMenuItem, PortalLayout, } from "../../../standalone/Portal";
import { Domain, Home } from "@material-ui/icons";
import { button, select } from "@storybook/addon-knobs";
import { FrameworkHistory, RoutedMenu } from "../../..";
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
}, { name: "CcPortalMenuStory" });
var usePortalStyles = makeStyles({
    menuWrapper: {
        backgroundColor: "#252525",
    },
    menuChildrenWrapper: {
        backgroundColor: "#1d1d1d",
    },
}, { name: "CcPortalMenuStyleStory" });
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
    }, "JumboDark");
    var classes = usePortalStyles();
    button("Navigate to Home (/)", function () { return FrameworkHistory.push("/"); });
    button("Navigate to Admin Item 1 (/admin/1)", function () {
        return FrameworkHistory.push("/admin/1");
    });
    button("Navigate to Admin Item 2 (/admin/2)", function () {
        return FrameworkHistory.push("/admin/2");
    });
    button("Navigate to Admin Item 3 (/admin/3)", function () {
        return FrameworkHistory.push("/admin/3");
    });
    button("Navigate to Admin Item 4 (/admin/4)", function () {
        return FrameworkHistory.push("/admin/4");
    });
    return (React.createElement(React.Fragment, null,
        React.createElement("style", { dangerouslySetInnerHTML: {
                __html: "\n\t\t\t\thtml, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; }\n\t\t\t",
            } }),
        React.createElement(PortalLayout, { variant: "basic", headerContent: React.createElement(Placeholder, { cssClass: "header" }), menuContent: React.createElement(RoutedMenu, { className: variant === "JumboDark" ? classes.menuWrapper : undefined, definition: [
                    {
                        icon: Home,
                        title: "Home",
                        route: "/",
                        shouldRender: true,
                    },
                    {
                        icon: Domain,
                        title: "Admin",
                        shouldRender: true,
                        children: [
                            {
                                title: "Item 1",
                                route: "/admin/1",
                                shouldRender: true,
                            },
                            {
                                title: "Item 2",
                                route: "/admin/2",
                                shouldRender: true,
                            },
                            {
                                title: "Item 3",
                                route: "/admin/3",
                                shouldRender: true,
                            },
                            {
                                title: "Item 4",
                                route: "/admin/4",
                                shouldRender: false,
                            },
                        ],
                    },
                ], wrapper: List, menuItem: variant === "JumboDark"
                    ? JumboReactDarkMenuItem
                    : variant === "JumboLight"
                        ? JumboReactLightMenuItem
                        : MaterialMenuItem, childWrapperClassName: variant === "JumboDark" ? classes.menuChildrenWrapper : undefined }), topLeft: React.createElement(Placeholder, { cssClass: "topLeft" }), content: React.createElement(Placeholder, { cssClass: "content" }), drawerWidth: 320 })));
};
PortalMenuStory.storyName = "Menu";
