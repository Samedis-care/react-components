import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { createContext, useCallback, useContext, useId, useMemo, useState, } from "react";
import Header from "./Header";
import Menu from "./Menu";
import { buttonBaseClasses, IconButton, styled, useMediaQuery, useTheme, useThemeProps, } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import useCCTranslations from "../../../utils/useCCTranslations";
import focusRing from "../focusRing";
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
// The drawer's close button, for screen readers and keyboard users. Visually
// hidden and out of the flow, so the drawer looks as without it; shown only while
// it has keyboard focus (as a skip link), at the top of the drawer, over the
// content. The X lines up with the end of the menu entries (16px inset).
const RenderLayoutCloseMenuButton = styled(IconButton, {
    name: "CcPortalRenderLayout",
    slot: "closeMenuButton",
})(({ theme }) => ({
    position: "absolute",
    top: theme.spacing(0.5),
    insetInlineEnd: theme.spacing(0.5),
    zIndex: 1,
    [`&.${buttonBaseClasses.focusVisible}`]: {
        // the drawer's surface, with its overlay in a dark theme, so the
        // content it covers does not show through
        backgroundColor: (theme.vars || theme).palette.background.paper,
        backgroundImage: "var(--Paper-overlay)",
    },
    [`&:not(.${buttonBaseClasses.focusVisible})`]: {
        // visually hidden, as MUI's visuallyHidden
        border: 0,
        clipPath: "inset(50%)",
        height: 1,
        margin: -1,
        overflow: "hidden",
        padding: 0,
        whiteSpace: "nowrap",
        width: 1,
    },
}), ({ theme }) => focusRing((theme.vars || theme).palette.primary.main));
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
    // the mobile drawer's paper, named by the burger's aria-controls
    const drawerId = useId();
    const { t } = useCCTranslations();
    const toggleMenu = useCallback(() => setMenuOpen((prevState) => !prevState), [setMenuOpen]);
    // closes, never toggles: a second click while the drawer slides out keeps it closed
    const closeMenu = useCallback(() => setMenuOpen(false), [setMenuOpen]);
    const portalContext = useMemo(() => ({
        mobile,
        menuOpen,
        setMenuOpen,
    }), [mobile, menuOpen, setMenuOpen]);
    return (_jsxs(PortalLayoutContext.Provider, { value: portalContext, children: [!props.mobile && props.variant === "basic" && (_jsx(RenderLayoutTopLeft, { children: props.topLeft })), _jsx(RenderLayoutHeader, { id: props.headerId, children: headerContent && (_jsx(Header, { contents: headerContent, toggleMenu: toggleMenu, mobile: mobile && !!menuContent, drawerId: drawerId, customClasses: props.customClasses?.header })) }), _jsx(RenderLayoutMenu, { id: props.menuId, children: menuContent && (_jsx(Menu, { menuOpen: menuOpen, drawerWidth: drawerWidth, toggleMenu: toggleMenu, mobile: mobile, drawerId: drawerId, items: _jsxs(_Fragment, { children: [mobile && (_jsx(RenderLayoutCloseMenuButton, { onClick: closeMenu, size: "large", "aria-label": t("standalone.portal.close-menu"), children: _jsx(CloseIcon, {}) })), mobile && props.variant === "basic" && (_jsx(RenderLayoutMobileTopLeft, { children: props.topLeft })), menuContent] }) })) }), _jsx(RenderLayoutMain, { id: props.mainId, children: content })] }));
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
    return (_jsx(Container, { ownerState: {
            mobile,
            variant: props.variant,
            drawerWidth: props.drawerWidth,
        }, className: className, children: _jsx(RenderLayoutMemo, { mobile: mobile, ...rendererProps }) }));
};
export default React.memo(PortalLayout);
