import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { ListItemButton, listItemButtonClasses, ListItemIcon, ListItemText, listItemTextClasses, styled, useThemeProps, } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import focusRing from "../../focusRing";
/** width of the bar on the active entry's left edge, in px */
const ACTIVE_BAR_WIDTH = 4;
const StyledListItem = styled(ListItemButton, {
    name: "CcMenuItemMaterial",
    slot: "root",
})(({ theme }) => ({
    ...focusRing(theme.palette.primary.main),
    // not MUI's selected tint only, which forced-colors mode replaces: a bar on
    // the left edge and a medium-weight title. The bar is a border (forced colors
    // keep borders) on an overlay, so the title stays in line with the others.
    [`&.${listItemButtonClasses.selected}`]: {
        "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            borderLeft: `${ACTIVE_BAR_WIDTH}px solid ${(theme.vars || theme).palette.primary.main}`,
            pointerEvents: "none",
        },
        [`& .${listItemTextClasses.primary}`]: {
            fontWeight: theme.typography.fontWeightMedium,
        },
    },
}));
const MenuItemMaterial = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcMenuItemMaterial" });
    const Icon = props.icon;
    return (_jsxs(StyledListItem, { ref: props.focusRef, onClick: props.onClick, onAuxClick: props.onAuxClick, ...props.ariaAttributes, selected: props.active, children: [_jsx(ListItemIcon, { children: Icon && _jsx(Icon, {}) }), _jsx(ListItemText, { primary: props.title }), props.expandable && (props.expanded ? _jsx(ExpandLess, {}) : _jsx(ExpandMore, {}))] }));
};
/**
 * Menu entry renderer (exported as `MaterialMenuItem`) for MenuBase and
 * RoutedMenu: an MUI ListItemButton with an icon column, the title, and an
 * expand chevron for groups. The active entry is `selected`: MUI's selected
 * tint, a bar in the primary color on its left edge and a medium-weight title.
 */
export default React.memo(MenuItemMaterial);
