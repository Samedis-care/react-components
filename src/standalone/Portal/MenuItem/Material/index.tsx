import React from "react";
import { IMenuItemProps } from "../../Menu";
import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { ExpandLess, ExpandMore } from "@material-ui/icons";

export default (props: IMenuItemProps) => (
	<ListItem button onClick={props.onClick}>
		<ListItemIcon>{props.icon}</ListItemIcon>
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
