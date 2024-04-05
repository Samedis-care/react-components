import React from "react";
import { ListItemButton, ListItemIcon, ListItemText, styled, useThemeProps, } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import combineClassNames from "../../../../../utils/combineClassNames";
const MyListItem = styled(ListItemButton, {
    name: "CcMenuItemJumboReactDark",
    slot: "root",
})(({ theme }) => ({
    borderBottomRightRadius: "30px",
    borderTopRightRadius: "30px",
    width: "calc(100% - 20px)",
    color: "#a1a1a1",
    "&.Mui-active": {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.getContrastText(theme.palette.primary.main),
    },
    "& .MuiListItemButton-button:hover": {
        color: "white",
        backgroundColor: "#1d1d1d",
        "&.Mui-active": {
            backgroundColor: theme.palette.primary.main,
        },
        "&.Cc-expandable": {
            backgroundColor: "transparent",
        },
    },
}));
const StyledListItemIcon = styled(ListItemIcon, {
    name: "CcMenuItemJumboReactDark",
    slot: "icon",
})({
    color: "inherit",
});
const Dot = styled("div", { name: "CcMenuItemJumboReactDark", slot: "dot" })(({ theme }) => ({
    width: 6,
    height: 6,
    backgroundColor: theme.palette.getContrastText(theme.palette.primary.main),
    borderRadius: "50%",
    top: "50%",
}));
const typographyProps = { variant: "body2" };
const MenuItemJumboReactDark = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcMenuItemJumboReactDark",
    });
    const Icon = props.icon;
    return (React.createElement(MyListItem, { onClick: props.onClick, onAuxClick: props.onAuxClick, className: combineClassNames([
            props.active && "Mui-active",
            props.expandable && "Cc-expandable",
        ]) },
        React.createElement(StyledListItemIcon, null, Icon && React.createElement(Icon, null)),
        React.createElement(ListItemText, { primary: props.title, primaryTypographyProps: props.typographyProps ?? typographyProps }),
        props.expandable && (props.expanded ? React.createElement(ExpandLess, null) : React.createElement(ExpandMore, null)),
        props.active && React.createElement(Dot, null)));
};
export default React.memo(MenuItemJumboReactDark);
