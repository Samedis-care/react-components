import { Drawer, Paper, useTheme } from "@mui/material";
import React, { useMemo } from "react";
import makeStyles from "@mui/styles/makeStyles";
const modalProps = {
    keepMounted: true, // Better open performance on mobile.
};
const useStyles = makeStyles({
    menuPaper: (props) => ({
        width: props.drawerWidth,
        height: "100%",
    }),
}, { name: "CcPortalLayoutMenu" });
const PortalLayoutMenu = (props) => {
    const { menuOpen, toggleMenu } = props;
    const theme = useTheme();
    const classes = useStyles(props);
    const paperProps = useMemo(() => ({
        className: classes.menuPaper,
    }), [classes.menuPaper]);
    if (!props.mobile) {
        return React.createElement(Paper, { ...paperProps }, props.items);
    }
    else {
        return (React.createElement(Drawer, { variant: "temporary", anchor: theme.direction === "rtl" ? "right" : "left", open: menuOpen, onClose: toggleMenu, PaperProps: paperProps, ModalProps: modalProps }, props.items));
    }
};
export default React.memo(PortalLayoutMenu);
