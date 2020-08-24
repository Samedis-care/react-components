import {
	createStyles,
	IconButton,
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
export const SmallListItem = withStyles(smallListItemStyles)(ListItem);

const selectorSmallListItemStyles = createStyles({
	gutters: {
		paddingLeft: 0,
	},
});
export const SelectorSmallListItem = withStyles(selectorSmallListItemStyles)(
	SmallListItem
);

const smallListItemIconStyles = createStyles({
	root: {
		minWidth: 0,
		paddingRight: 8,
	},
});
export const SmallListItemIcon = withStyles(smallListItemIconStyles)(
	ListItemIcon
);

const smallIconButtonStyles = createStyles({
	root: {
		padding: 4,
	},
});
export const SmallIconButton = withStyles(smallIconButtonStyles)(IconButton);
