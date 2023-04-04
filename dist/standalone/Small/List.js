import { createStyles, ListItem, ListItemIcon, withStyles, } from "@material-ui/core";
var smallListItemStyles = createStyles({
    gutters: {
        paddingLeft: 8,
        paddingRight: 8,
    },
});
export var SmallListItem = withStyles(smallListItemStyles, {
    name: "SmallListItem",
})(ListItem);
var selectorSmallListItemStyles = createStyles({
    gutters: {
        paddingLeft: 0,
        paddingRight: 8,
    },
});
export var SelectorSmallListItem = withStyles(selectorSmallListItemStyles, {
    name: "SelectorSmallListItem",
})(ListItem);
var smallListItemIconStyles = createStyles({
    root: {
        minWidth: 0,
        paddingRight: 8,
    },
});
export var SmallListItemIcon = withStyles(smallListItemIconStyles)(ListItemIcon);
