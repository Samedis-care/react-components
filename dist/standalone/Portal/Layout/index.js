import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { createContext, useCallback, useContext, useId, useMemo, useRef, useState, } from "react";
import Header from "./Header";
import Menu from "./Menu";
import { buttonBaseClasses, IconButton, styled, useMediaQuery, useTheme, useThemeProps, } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import useCCTranslations from "../../../utils/useCCTranslations";
import focusRing from "../focusRing";
import useResetScrollOnNavigation from "../../Routes/useResetScrollOnNavigation";
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
// the page's navigation landmark around menuContent, in the desktop paper and
// in the drawer. It fills the paper (below the drawer's topLeft row) as
// menuContent did without it: a flex column that may shrink below its content,
// so a menu with height 100% fills it and scrolls inside it.
const RenderLayoutNav = styled("nav", {
    name: "CcPortalRenderLayout",
    slot: "nav",
})({
    height: "100%",
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
});
// the page's main landmark and the pane the pages scroll in
const RenderLayoutMain = styled("main", {
    name: "CcPortalRenderLayout",
    slot: "main",
})(({ theme }) => ({
    gridArea: "main",
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    // focused from the keyboard (a skip link), or by a script after keyboard
    // use: the Portal's focus ring, inside the pane, where the screen's edge
    // cannot clip it
    "&:focus-visible": {
        outline: `2px solid ${(theme.vars || theme).palette.primary.main}`,
        outlineOffset: -2,
    },
}));
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
    // the pane the pages scroll in: a navigation starts the next page at its top
    const mainRef = useRef(null);
    useResetScrollOnNavigation(mainRef);
    const { t } = useCCTranslations();
    const toggleMenu = useCallback(() => setMenuOpen((prevState) => !prevState), [setMenuOpen]);
    // closes, never toggles: a second click while the drawer slides out keeps it closed
    const closeMenu = useCallback(() => setMenuOpen(false), [setMenuOpen]);
    const portalContext = useMemo(() => ({
        mobile,
        menuOpen,
        setMenuOpen,
    }), [mobile, menuOpen, setMenuOpen]);
    return (_jsxs(PortalLayoutContext.Provider, { value: portalContext, children: [!props.mobile && props.variant === "basic" && (_jsx(RenderLayoutTopLeft, { children: props.topLeft })), _jsx(RenderLayoutHeader, { id: props.headerId, children: headerContent && (_jsx(Header, { contents: headerContent, toggleMenu: toggleMenu, mobile: mobile && !!menuContent, drawerId: drawerId, customClasses: props.customClasses?.header })) }), _jsx(RenderLayoutMenu, { children: menuContent && (_jsx(Menu, { menuOpen: menuOpen, drawerWidth: drawerWidth, toggleMenu: toggleMenu, mobile: mobile, drawerId: drawerId, items: _jsxs(_Fragment, { children: [mobile && (_jsx(RenderLayoutCloseMenuButton, { onClick: closeMenu, size: "large", "aria-label": t("standalone.portal.close-menu"), children: _jsx(CloseIcon, {}) })), mobile && props.variant === "basic" && (_jsx(RenderLayoutMobileTopLeft, { children: props.topLeft })), _jsx(RenderLayoutNav, { id: props.menuId, "aria-label": t("standalone.portal.main-menu"), children: menuContent })] }) })) }), _jsx(RenderLayoutMain, { id: props.mainId, ref: mainRef, tabIndex: -1, children: content })] }));
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
/**
 * App shell: a header (an MUI AppBar, the page's banner landmark), a menu (in
 * the page's navigation landmark) and the content (in the page's main
 * landmark), laid out as a CSS grid that fills its parent's height.
 *
 * Below `collapseBreakpoint`, with `collapseMenu`, or while
 * `mobileViewCondition` matches, the menu moves into a drawer that a burger
 * button in the header opens. Descendants read the mode and the drawer state
 * with {@link usePortalLayoutContext}.
 */
export default React.memo(PortalLayout);
