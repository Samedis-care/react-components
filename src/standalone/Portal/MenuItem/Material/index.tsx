import React from "react";
import { MenuItemProps } from "../../Menu";
import {
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Theme,
} from "@mui/material";
import { withStyles, CSSProperties } from "@mui/styles";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

export interface MenuItemTheme {
	borderRadius?: CSSProperties["borderRadius"];
	border?: CSSProperties["border"];
	backgroundColor?: CSSProperties["backgroundColor"];
	color?: CSSProperties["color"];
	padding?: CSSProperties["padding"];
	margin?: CSSProperties["margin"];
	height?: CSSProperties["height"];
	width?: CSSProperties["width"];
	overflow?: CSSProperties["overflow"];
	style?: CSSProperties;
	icon?: {
		color?: CSSProperties["color"];
		style?: CSSProperties;
	};
}

const StyledListItem = withStyles((theme: Theme) => ({
	root: {
		borderRadius: theme.componentsCare?.portal?.menuItem?.borderRadius,
		border: theme.componentsCare?.portal?.menuItem?.border,
		backgroundColor: theme.componentsCare?.portal?.menuItem?.backgroundColor,
		color: theme.componentsCare?.portal?.menuItem?.color,

		padding: theme.componentsCare?.portal?.menuItem?.padding,
		margin: theme.componentsCare?.portal?.menuItem?.margin,

		"& svg": {
			fill:
				theme.componentsCare?.portal?.menuItem?.icon?.color ||
				theme.componentsCare?.portal?.menuItem?.color,
			...theme.componentsCare?.portal?.menuItem?.icon?.style,
		},
		...theme.componentsCare?.portal?.menuItem?.style,
	},
}))(ListItemButton) as typeof ListItemButton;

const MenuItemMaterial = (props: MenuItemProps) => {
	const Icon = props.icon;
	return (
		<StyledListItem
			onClick={props.onClick}
			onAuxClick={props.onAuxClick}
			selected={props.active}
		>
			<ListItemIcon>{Icon && <Icon />}</ListItemIcon>
			<ListItemText primary={props.title} />
			{props.expandable && (props.expanded ? <ExpandLess /> : <ExpandMore />)}
		</StyledListItem>
	);
};

export default React.memo(MenuItemMaterial);
