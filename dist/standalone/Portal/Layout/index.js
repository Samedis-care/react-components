import React, { createContext, useCallback, useContext, useMemo, useState, } from "react";
import Header from "./Header";
import Menu from "./Menu";
import makeStyles from "@mui/styles/makeStyles";
import { useMediaQuery, useTheme } from "@mui/material";
const useContainerStyles = makeStyles({
    containerDesktop: (props) => ({
        display: "grid",
        gridTemplateAreas: props.variant === "basic"
            ? `"top-left top" "sidebar main"`
            : `"top top" "sidebar main"`,
        gridTemplateRows: "max-content 100fr",
        gridTemplateColumns: `${props.drawerWidth ? `${props.drawerWidth}px` : "max-content"} 100fr`,
        height: "100%",
    }),
    containerMobile: (props) => ({
        display: "grid",
        gridTemplateAreas: `"top top" "main main"`,
        gridTemplateRows: "max-content 100fr",
        gridTemplateColumns: `${props.drawerWidth ? `${props.drawerWidth}px` : "max-content"} 100fr`,
        height: "100%",
    }),
}, { name: "CcPortalLayout" });
const useStyles = makeStyles({
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
export const PortalLayoutContext = createContext(undefined);
export const usePortalLayoutContext = () => {
    const ctx = useContext(PortalLayoutContext);
    if (!ctx)
        throw new Error("PortalLayoutContext not set");
    return ctx;
};
const RenderLayout = (props) => {
    const { mobile, headerContent, drawerWidth, menuContent, content } = props;
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleMenu = useCallback(() => setMenuOpen((prevState) => !prevState), [setMenuOpen]);
    const classes = useStyles(props);
    const portalContext = useMemo(() => ({
        mobile,
        menuOpen,
        setMenuOpen,
    }), [mobile, menuOpen, setMenuOpen]);
    return (React.createElement(PortalLayoutContext.Provider, { value: portalContext },
        !props.mobile && props.variant === "basic" && (React.createElement("div", { className: classes.topLeft }, props.topLeft)),
        React.createElement("div", { id: props.headerId, className: classes.header }, headerContent && (React.createElement(Header, { contents: headerContent, toggleMenu: toggleMenu, mobile: mobile && !!menuContent, customClasses: props.customClasses?.header }))),
        React.createElement("div", { id: props.menuId, className: classes.menu }, menuContent && (React.createElement(Menu, { menuOpen: menuOpen, drawerWidth: drawerWidth, toggleMenu: toggleMenu, mobile: mobile, items: React.createElement(React.Fragment, null,
                mobile && props.variant === "basic" && (React.createElement("div", { className: classes.mobileTopLeft }, props.topLeft)),
                menuContent) }))),
        React.createElement("div", { id: props.mainId, className: classes.main }, content)));
};
const RenderLayoutMemo = React.memo(RenderLayout);
const PortalLayout = (props) => {
    const classes = useContainerStyles(props);
    const theme = useTheme();
    const mobileViewConditionMet = useMediaQuery(props.mobileViewCondition || "()");
    const shouldCollapse = useMediaQuery(theme.breakpoints.down(props.collapseBreakpoint ?? "md"));
    const mobile = !!(shouldCollapse ||
        props.collapseMenu ||
        (props.mobileViewCondition && mobileViewConditionMet));
    return (React.createElement("div", { className: mobile ? classes.containerMobile : classes.containerDesktop },
        React.createElement(RenderLayoutMemo, { mobile: mobile, ...props })));
};
export default React.memo(PortalLayout);
