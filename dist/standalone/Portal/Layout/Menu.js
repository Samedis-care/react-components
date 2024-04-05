import { Drawer, Paper, styled, useTheme, useThemeProps } from "@mui/material";
import React, { useMemo } from "react";
import combineClassNames from "../../../utils/combineClassNames";
const modalProps = {
    keepMounted: true, // Better open performance on mobile.
};
const MenuPaper = styled(Paper, {
    name: "CcPortalLayoutMenu",
    slot: "menuPaper",
})({
    height: "100%",
});
const MenuDrawer = styled(Drawer, {
    name: "CcPortalLayoutMenu",
    slot: "menuDrawer",
})({});
const PortalLayoutMenu = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcPortalLayoutMenu" });
    const { menuOpen, toggleMenu, drawerWidth, className, classes } = props;
    const theme = useTheme();
    const paperProps = useMemo(() => ({
        style: { width: drawerWidth },
    }), [drawerWidth]);
    if (!props.mobile) {
        return (React.createElement(MenuPaper, { ...paperProps, className: combineClassNames([className, classes?.menuPaper]) }, props.items));
    }
    else {
        return (React.createElement(MenuDrawer, { variant: "temporary", anchor: theme.direction === "rtl" ? "right" : "left", open: menuOpen, onClose: toggleMenu, PaperProps: paperProps, ModalProps: modalProps, className: combineClassNames([className, classes?.menuDrawer]) }, props.items));
    }
};
export default React.memo(PortalLayoutMenu);
