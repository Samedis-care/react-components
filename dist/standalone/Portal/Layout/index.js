var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React, { createContext, useCallback, useContext, useMemo, useState, } from "react";
import Header from "./Header";
import Menu from "./Menu";
import makeStyles from "@mui/styles/makeStyles";
import { useMediaQuery, useTheme } from "@mui/material";
var useContainerStyles = makeStyles({
    containerDesktop: function (props) { return ({
        display: "grid",
        gridTemplateAreas: props.variant === "basic"
            ? "\"top-left top\" \"sidebar main\""
            : "\"top top\" \"sidebar main\"",
        gridTemplateRows: "max-content 100fr",
        gridTemplateColumns: "".concat(props.drawerWidth ? "".concat(props.drawerWidth, "px") : "max-content", " 100fr"),
        height: "100%",
    }); },
    containerMobile: function (props) { return ({
        display: "grid",
        gridTemplateAreas: "\"top top\" \"main main\"",
        gridTemplateRows: "max-content 100fr",
        gridTemplateColumns: "".concat(props.drawerWidth ? "".concat(props.drawerWidth, "px") : "max-content", " 100fr"),
        height: "100%",
    }); },
}, { name: "CcPortalLayout" });
var useStyles = makeStyles({
    header: {
        gridArea: "top",
    },
    topLeft: {
        gridArea: "top-left",
    },
    menu: {
        gridArea: "sidebar",
        minHeight: "100%",
    },
    main: {
        gridArea: "main",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
    },
    mobileTopLeft: {
        height: 56,
    },
}, { name: "CcRenderLayout" });
export var PortalLayoutContext = createContext(undefined);
export var usePortalLayoutContext = function () {
    var ctx = useContext(PortalLayoutContext);
    if (!ctx)
        throw new Error("PortalLayoutContext not set");
    return ctx;
};
var RenderLayout = function (props) {
    var _a;
    var mobile = props.mobile, headerContent = props.headerContent, drawerWidth = props.drawerWidth, menuContent = props.menuContent, content = props.content;
    var _b = useState(false), menuOpen = _b[0], setMenuOpen = _b[1];
    var toggleMenu = useCallback(function () { return setMenuOpen(function (prevState) { return !prevState; }); }, [
        setMenuOpen,
    ]);
    var classes = useStyles(props);
    var portalContext = useMemo(function () { return ({
        mobile: mobile,
        menuOpen: menuOpen,
        setMenuOpen: setMenuOpen,
    }); }, [mobile, menuOpen, setMenuOpen]);
    return (React.createElement(PortalLayoutContext.Provider, { value: portalContext },
        !props.mobile && props.variant === "basic" && (React.createElement("div", { className: classes.topLeft }, props.topLeft)),
        React.createElement("div", { id: props.headerId, className: classes.header }, headerContent && (React.createElement(Header, { contents: headerContent, toggleMenu: toggleMenu, mobile: mobile && !!menuContent, customClasses: (_a = props.customClasses) === null || _a === void 0 ? void 0 : _a.header }))),
        React.createElement("div", { id: props.menuId, className: classes.menu }, menuContent && (React.createElement(Menu, { menuOpen: menuOpen, drawerWidth: drawerWidth, toggleMenu: toggleMenu, mobile: mobile, items: React.createElement(React.Fragment, null,
                mobile && props.variant === "basic" && (React.createElement("div", { className: classes.mobileTopLeft }, props.topLeft)),
                menuContent) }))),
        React.createElement("div", { id: props.mainId, className: classes.main }, content)));
};
var RenderLayoutMemo = React.memo(RenderLayout);
var PortalLayout = function (props) {
    var _a;
    var classes = useContainerStyles(props);
    var theme = useTheme();
    var mobileViewConditionMet = useMediaQuery(props.mobileViewCondition || "()");
    var shouldCollapse = useMediaQuery(theme.breakpoints.down((_a = props.collapseBreakpoint) !== null && _a !== void 0 ? _a : "sm"));
    var mobile = !!(shouldCollapse ||
        props.collapseMenu ||
        (props.mobileViewCondition && mobileViewConditionMet));
    return (React.createElement("div", { className: mobile ? classes.containerMobile : classes.containerDesktop },
        React.createElement(RenderLayoutMemo, __assign({ mobile: mobile }, props))));
};
export default React.memo(PortalLayout);
