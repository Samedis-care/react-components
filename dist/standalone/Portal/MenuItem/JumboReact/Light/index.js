import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { ListItemButton, ListItemIcon, ListItemText, styled, useThemeProps, } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import combineClassNames from "../../../../../utils/combineClassNames";
const MyListItem = styled(ListItemButton, {
    name: "CcMenuItemJumboReactLight",
    slot: "root",
})(({ theme }) => ({
    borderBottomRightRadius: "30px",
    borderTopRightRadius: "30px",
    width: "calc(100% - 20px)",
    "&.Mui-active": {
        color: theme.palette.getContrastText(theme.palette.primary.main),
        backgroundColor: theme.palette.primary.main,
    },
    "& .MuiListItemButton-button:hover": {
        color: theme.palette.primary.main,
        backgroundColor: "transparent",
        "&.Cc-expandable": {
            color: "unset",
            backgroundColor: "transparent",
        },
        "&.Mui-active": {
            backgroundColor: theme.palette.primary.main,
        },
    },
}));
const Dot = styled("div", { name: "CcMenuItemJumboReactLight", slot: "dot" })(({ theme }) => ({
    width: 6,
    height: 6,
    backgroundColor: theme.palette.getContrastText(theme.palette.primary.main),
    borderRadius: "50%",
    top: "50%",
}));
const typographyProps = { variant: "body2" };
const MenuItemJumboReactLight = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcMenuItemJumboReactLight",
    });
    const Icon = props.icon;
    return (_jsxs(MyListItem, { onClick: props.onClick, onAuxClick: props.onAuxClick, className: combineClassNames([
            props.active && "Mui-active",
            props.expandable && "Cc-expandable",
        ]), children: [_jsx(ListItemIcon, { children: Icon && _jsx(Icon, {}) }), _jsx(ListItemText, { primary: props.title, slotProps: { primary: props.typographyProps ?? typographyProps } }), props.expandable && (props.expanded ? _jsx(ExpandLess, {}) : _jsx(ExpandMore, {})), props.active && _jsx(Dot, {})] }));
};
export default React.memo(MenuItemJumboReactLight);
