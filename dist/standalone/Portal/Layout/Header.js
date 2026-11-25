import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AppBar, IconButton, styled, Toolbar, } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import React from "react";
import useCCTranslations from "../../../utils/useCCTranslations";
import focusRing from "../focusRing";
import { usePortalLayoutContext } from "./index";
// on the AppBar (color "primary"), so the ring takes its text color
const MenuButton = styled(IconButton)(({ theme }) => focusRing(theme.palette.primary.contrastText));
const PortalLayoutHeader = (props) => {
    const { mobile, customClasses, toggleMenu, contents, drawerId } = props;
    const { t } = useCCTranslations();
    const { menuOpen } = usePortalLayoutContext();
    return (_jsx(AppBar, { position: "relative", classes: customClasses?.appBar, children: _jsxs(Toolbar, { classes: customClasses?.toolbar, children: [mobile && (_jsx(MenuButton, { onClick: toggleMenu, size: "large", "aria-label": t("standalone.portal.menu-toggle"), "aria-expanded": menuOpen, "aria-controls": drawerId, children: _jsx(MenuIcon, {}) })), contents] }) }));
};
export default React.memo(PortalLayoutHeader);
