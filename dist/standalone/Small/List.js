import { ListItem, ListItemButton, ListItemIcon, styled } from "@mui/material";
export const SmallListItem = styled(ListItem)({
    "& .MuiListItem-gutters": {
        paddingLeft: 8,
        paddingRight: 8,
    },
});
export const SmallListItemButton = styled(ListItemButton)({
    "& .MuiListItem-gutters": {
        paddingLeft: 8,
        paddingRight: 8,
    },
});
export const SelectorSmallListItem = styled(ListItem)({
    "& .MuiListItem-gutters": {
        paddingLeft: 0,
        paddingRight: 8,
    },
});
export const SelectorSmallListItemButton = styled(ListItemButton)({
    "& .MuiListItem-gutters": {
        paddingLeft: 0,
        paddingRight: 8,
    },
});
export const SmallListItemIcon = styled(ListItemIcon)({
    minWidth: 0,
    paddingRight: 8,
});
