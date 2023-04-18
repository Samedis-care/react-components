import { ListItem, ListItemButton, ListItemIcon } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";
var smallListItemStyles = createStyles({
    gutters: {
        paddingLeft: 8,
        paddingRight: 8,
    },
});
export var SmallListItem = withStyles(smallListItemStyles, {
    name: "SmallListItem",
})(ListItem);
export var SmallListItemButton = withStyles(smallListItemStyles, {
    name: "SmallListItemButton",
})(ListItemButton);
var selectorSmallListItemStyles = createStyles({
    gutters: {
        paddingLeft: 0,
        paddingRight: 8,
    },
});
export var SelectorSmallListItem = withStyles(selectorSmallListItemStyles, {
    name: "SelectorSmallListItem",
})(ListItem);
export var SelectorSmallListItemButton = withStyles(selectorSmallListItemStyles, {
    name: "SelectorSmallListItemButton",
})(ListItemButton);
var smallListItemIconStyles = createStyles({
    root: {
        minWidth: 0,
        paddingRight: 8,
    },
});
export var SmallListItemIcon = withStyles(smallListItemIconStyles)(ListItemIcon);
