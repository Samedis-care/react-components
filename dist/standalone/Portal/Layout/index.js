import React, { createContext, useCallback, useContext, useMemo, useState, } from "react";
import Header from "./Header";
import Menu from "./Menu";
import { styled, useMediaQuery, useTheme, useThemeProps } from "@mui/material";
import useMountLogging from "../../../utils/useMountLogging";
const Container = styled("div", {
    name: "CcPortalLayout",
    slot: "container",
})(({ ownerState: { variant, drawerWidth, mobile } }) => ({
    display: "grid",
    height: "100%",
    gridTemplateRows: "max-content 100fr",
    gridTemplateColumns: `${drawerWidth ? `${drawerWidth}px` : "max-content"} 100fr`,
    gridTemplateAreas: mobile
        ? `"top top" "main main"`
        : variant === "basic"
            ? `"top-left top" "sidebar main"`
            : `"top top" "sidebar main"`,
}));
const RenderLayoutHeader = styled("div", {
    name: "CcPortalRenderLayout",
    slot: "header",
})({ gridArea: "top" });
const RenderLayoutTopLeft = styled("div", {
    name: "CcPortalRenderLayout",
    slot: "topLeft",
})({ gridArea: "top-left" });
const RenderLayoutMenu = styled("div", {
    name: "CcPortalRenderLayout",
    slot: "menu",
})({ gridArea: "sidebar", minHeight: "100%" });
const RenderLayoutMain = styled("div", {
    name: "CcPortalRenderLayout",
    slot: "main",
})({
    gridArea: "main",
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
});
const RenderLayoutMobileTopLeft = styled("div", {
    name: "CcPortalRenderLayout",
    slot: "mobileTopLeft",
})({ height: 56 });
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
    const portalContext = useMemo(() => ({
        mobile,
        menuOpen,
        setMenuOpen,
    }), [mobile, menuOpen, setMenuOpen]);
    useMountLogging({ name: "RenderLayoutMemo" });
    return (React.createElement(PortalLayoutContext.Provider, { value: portalContext },
        !props.mobile && props.variant === "basic" && (React.createElement(RenderLayoutTopLeft, null, props.topLeft)),
        React.createElement(RenderLayoutHeader, { id: props.headerId }, headerContent && (React.createElement(Header, { contents: headerContent, toggleMenu: toggleMenu, mobile: mobile && !!menuContent, customClasses: props.customClasses?.header }))),
        React.createElement(RenderLayoutMenu, { id: props.menuId }, menuContent && (React.createElement(Menu, { menuOpen: menuOpen, drawerWidth: drawerWidth, toggleMenu: toggleMenu, mobile: mobile, items: React.createElement(React.Fragment, null,
                mobile && props.variant === "basic" && (React.createElement(RenderLayoutMobileTopLeft, null, props.topLeft)),
                menuContent) }))),
        React.createElement(RenderLayoutMain, { id: props.mainId }, content)));
};
const RenderLayoutMemo = React.memo(RenderLayout);
const PortalLayout = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcPortalLayout" });
    const { className, ...rendererProps } = props;
    const theme = useTheme();
    const mobileViewConditionMet = useMediaQuery(props.mobileViewCondition || "()");
    const shouldCollapse = useMediaQuery(theme.breakpoints.down(props.collapseBreakpoint ?? "md"));
    const mobile = !!(shouldCollapse ||
        props.collapseMenu ||
        (props.mobileViewCondition && mobileViewConditionMet));
    useMountLogging({ name: "RenderLayout" });
    return (React.createElement(Container, { ownerState: {
            mobile,
            variant: props.variant,
            drawerWidth: props.drawerWidth,
        }, className: className },
        React.createElement(RenderLayoutMemo, { mobile: mobile, ...rendererProps })));
};
export default React.memo(PortalLayout);
