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
import { Drawer, Paper, useTheme } from "@mui/material";
import React, { useMemo } from "react";
import makeStyles from "@mui/styles/makeStyles";
var modalProps = {
    keepMounted: true, // Better open performance on mobile.
};
var useStyles = makeStyles({
    menuPaper: function (props) { return ({
        width: props.drawerWidth,
        height: "100%",
    }); },
}, { name: "CcPortalLayoutMenu" });
var PortalLayoutMenu = function (props) {
    var menuOpen = props.menuOpen, toggleMenu = props.toggleMenu;
    var theme = useTheme();
    var classes = useStyles(props);
    var paperProps = useMemo(function () { return ({
        className: classes.menuPaper,
    }); }, [classes.menuPaper]);
    if (!props.mobile) {
        return React.createElement(Paper, __assign({}, paperProps), props.items);
    }
    else {
        return (React.createElement(Drawer, { variant: "temporary", anchor: theme.direction === "rtl" ? "right" : "left", open: menuOpen, onClose: toggleMenu, PaperProps: paperProps, ModalProps: modalProps }, props.items));
    }
};
export default React.memo(PortalLayoutMenu);
