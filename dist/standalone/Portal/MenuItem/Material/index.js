import React from "react";
import { ListItemButton, ListItemIcon, ListItemText, styled, useThemeProps, } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
const StyledListItem = styled(ListItemButton, {
    name: "CcMenuItemMaterial",
    slot: "root",
})({});
const MenuItemMaterial = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcMenuItemMaterial" });
    const Icon = props.icon;
    return (React.createElement(StyledListItem, { onClick: props.onClick, onAuxClick: props.onAuxClick, selected: props.active },
        React.createElement(ListItemIcon, null, Icon && React.createElement(Icon, null)),
        React.createElement(ListItemText, { primary: props.title }),
        props.expandable && (props.expanded ? React.createElement(ExpandLess, null) : React.createElement(ExpandMore, null))));
};
export default React.memo(MenuItemMaterial);
