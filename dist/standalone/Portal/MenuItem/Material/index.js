import React from "react";
import { ListItemButton, ListItemIcon, ListItemText, } from "@mui/material";
import { withStyles } from "@mui/styles";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
const StyledListItem = withStyles((theme) => ({
    root: {
        borderRadius: theme.componentsCare?.portal?.menuItem?.borderRadius,
        border: theme.componentsCare?.portal?.menuItem?.border,
        backgroundColor: theme.componentsCare?.portal?.menuItem?.backgroundColor,
        color: theme.componentsCare?.portal?.menuItem?.color,
        padding: theme.componentsCare?.portal?.menuItem?.padding,
        margin: theme.componentsCare?.portal?.menuItem?.margin,
        "& svg": {
            fill: theme.componentsCare?.portal?.menuItem?.icon?.color ||
                theme.componentsCare?.portal?.menuItem?.color,
            ...theme.componentsCare?.portal?.menuItem?.icon?.style,
        },
        ...theme.componentsCare?.portal?.menuItem?.style,
    },
}))(ListItemButton);
const MenuItemMaterial = (props) => {
    const Icon = props.icon;
    return (React.createElement(StyledListItem, { onClick: props.onClick, onAuxClick: props.onAuxClick, selected: props.active },
        React.createElement(ListItemIcon, null, Icon && React.createElement(Icon, null)),
        React.createElement(ListItemText, { primary: props.title }),
        props.expandable && (props.expanded ? React.createElement(ExpandLess, null) : React.createElement(ExpandMore, null))));
};
export default React.memo(MenuItemMaterial);
