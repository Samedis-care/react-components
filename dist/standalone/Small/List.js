import { ListItem, ListItemButton, ListItemIcon } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";
const smallListItemStyles = createStyles({
    gutters: {
        paddingLeft: 8,
        paddingRight: 8,
    },
});
export const SmallListItem = withStyles(smallListItemStyles, {
    name: "SmallListItem",
})(ListItem);
export const SmallListItemButton = withStyles(smallListItemStyles, {
    name: "SmallListItemButton",
})(ListItemButton);
const selectorSmallListItemStyles = createStyles({
    gutters: {
        paddingLeft: 0,
        paddingRight: 8,
    },
});
export const SelectorSmallListItem = withStyles(selectorSmallListItemStyles, {
    name: "SelectorSmallListItem",
})(ListItem);
export const SelectorSmallListItemButton = withStyles(selectorSmallListItemStyles, {
    name: "SelectorSmallListItemButton",
})(ListItemButton);
const smallListItemIconStyles = createStyles({
    root: {
        minWidth: 0,
        paddingRight: 8,
    },
});
export const SmallListItemIcon = withStyles(smallListItemIconStyles)(ListItemIcon);
