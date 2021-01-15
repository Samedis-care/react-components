import {
	createStyles,
	ListItem,
	ListItemIcon,
	withStyles,
} from "@material-ui/core";

const smallListItemStyles = createStyles({
	gutters: {
		paddingLeft: 8,
		paddingRight: 8,
	},
});
export const SmallListItem = withStyles(smallListItemStyles, {
	name: "SmallListItem",
})(ListItem);

const selectorSmallListItemStyles = createStyles({
	gutters: {
		paddingLeft: 0,
		paddingRight: 8,
	},
});
export const SelectorSmallListItem = withStyles(selectorSmallListItemStyles, {
	name: "SelectorSmallListItem",
})(ListItem);

const smallListItemIconStyles = createStyles({
	root: {
		minWidth: 0,
		paddingRight: 8,
	},
});
export const SmallListItemIcon = withStyles(smallListItemIconStyles)(
	ListItemIcon
);
