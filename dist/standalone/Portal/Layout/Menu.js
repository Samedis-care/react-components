import { jsx as _jsx } from "react/jsx-runtime";
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
        return (_jsx(MenuPaper, { ...paperProps, className: combineClassNames([className, classes?.menuPaper]), children: props.items }));
    }
    else {
        return (_jsx(MenuDrawer, { variant: "temporary", anchor: theme.direction === "rtl" ? "right" : "left", open: menuOpen, onClose: toggleMenu, slotProps: { paper: paperProps }, ModalProps: modalProps, className: combineClassNames([className, classes?.menuDrawer]), children: props.items }));
    }
};
export default React.memo(PortalLayoutMenu);
