import React from "react";
import { IMenuItemProps } from "../../Menu";
import {
	ListItem,
	ListItemIcon,
	ListItemText,
	withStyles,
	Theme,
	ListItemProps,
} from "@material-ui/core";
import { ExpandLess, ExpandMore } from "@material-ui/icons";

const StyledListItem = withStyles((theme: Theme) => ({
	root: (props: ListItemProps) => ({
		borderRadius: theme.componentsCare?.portal?.menu?.selected?.borderRadius,
		color: theme.componentsCare?.portal?.menu?.color,
		backgroundColor: props.selected
			? theme.componentsCare?.portal?.menu?.selected?.backgroundColor
			: theme.componentsCare?.portal?.menu?.backgroundColor,

		"&:hover": {
			backgroundColor: props.selected
				? theme.componentsCare?.portal?.menu?.selected?.backgroundColor
				: theme.componentsCare?.portal?.menu?.hover?.backgroundColor,
		},
	}),
}))(ListItem);

const StyledListItemIcon = withStyles(() => ({
	root: {
		color: "inherit",
	},
}))(ListItemIcon);

const MenuItemMaterial = (props: IMenuItemProps) => {
	const Icon = props.icon;
	return (
		<StyledListItem button onClick={props.onClick} selected={props.active}>
			<StyledListItemIcon>{Icon && <Icon />}</StyledListItemIcon>
			<ListItemText primary={props.title} />
			{props.expandable ? (
				props.expanded ? (
					<ExpandLess />
				) : (
					<ExpandMore />
				)
			) : (
				false
			)}
		</StyledListItem>
	);
};

export default React.memo(MenuItemMaterial);
