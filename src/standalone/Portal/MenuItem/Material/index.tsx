import React from "react";
import { IMenuItemProps } from "../../Menu";
import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { ExpandLess, ExpandMore } from "@material-ui/icons";

export default React.memo((props: IMenuItemProps) => {
	const Icon = props.icon;
	return (
		<ListItem button onClick={props.onClick} selected={props.active}>
			<ListItemIcon>{Icon && <Icon />}</ListItemIcon>
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
		</ListItem>
	);
});
