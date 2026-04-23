import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs(StyledListItem, { onClick: props.onClick, onAuxClick: props.onAuxClick, selected: props.active, children: [_jsx(ListItemIcon, { children: Icon && _jsx(Icon, {}) }), _jsx(ListItemText, { primary: props.title }), props.expandable && (props.expanded ? _jsx(ExpandLess, {}) : _jsx(ExpandMore, {}))] }));
};
export default React.memo(MenuItemMaterial);
