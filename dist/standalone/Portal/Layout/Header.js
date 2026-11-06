import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AppBar, IconButton, styled, Toolbar, } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import React from "react";
import useCCTranslations from "../../../utils/useCCTranslations";
import focusRing from "../focusRing";
// on the AppBar (color "primary"), so the ring takes its text color
const MenuButton = styled(IconButton)(({ theme }) => focusRing(theme.palette.primary.contrastText));
const PortalLayoutHeader = (props) => {
    const { mobile, customClasses, toggleMenu, contents } = props;
    const { t } = useCCTranslations();
    return (_jsx(AppBar, { position: "relative", classes: customClasses?.appBar, children: _jsxs(Toolbar, { classes: customClasses?.toolbar, children: [mobile && (_jsx(MenuButton, { onClick: toggleMenu, size: "large", "aria-label": t("standalone.portal.menu-toggle"), children: _jsx(MenuIcon, {}) })), contents] }) }));
};
export default React.memo(PortalLayoutHeader);
