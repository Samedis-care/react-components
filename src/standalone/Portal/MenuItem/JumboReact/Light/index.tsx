import React from "react";
import { IMenuItemProps } from "../../../Menu";
import {
	createStyles,
	ListItem,
	ListItemIcon,
	ListItemText,
	Theme,
	TypographyProps,
	withStyles,
} from "@material-ui/core";
import { ExpandLess, ExpandMore } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
	item: {
		borderBottomRightRadius: "30px",
		borderTopRightRadius: "30px",
		width: "calc(100% - 20px)",
	},
	selectedItem: {
		color: theme.palette.getContrastText(theme.palette.primary.main),
		backgroundColor: theme.palette.primary.main,
	},
	dot: {
		width: 6,
		height: 6,
		backgroundColor: theme.palette.getContrastText(theme.palette.primary.main),
		borderRadius: "50%",
		top: "50%",
	},
}));

const selectedListItemStyles = createStyles((theme: Theme) => ({
	button: {
		"&:hover": {
			backgroundColor: theme.palette.primary.main,
		},
	},
}));
const unselectedListItemStyles = createStyles((theme: Theme) => ({
	button: {
		"&:hover": {
			color: theme.palette.primary.main,
			backgroundColor: "transparent",
		},
	},
}));
const expandableListItemStyles = createStyles({
	button: {
		"&:hover": {
			backgroundColor: "transparent",
		},
	},
});

const SelectedListItem = withStyles(selectedListItemStyles)(ListItem);
const UnselectedListItem = withStyles(unselectedListItemStyles)(ListItem);
const ExpandableListItem = withStyles(expandableListItemStyles)(ListItem);

const typographyProps: TypographyProps = { variant: "body2" };

const MenuItemJumboReactLight = (props: IMenuItemProps) => {
	const classes = useStyles();

	const Icon = props.icon;

	const MyListItem = props.expandable
		? ExpandableListItem
		: props.active
		? SelectedListItem
		: UnselectedListItem;

	return (
		<MyListItem
			button
			onClick={props.onClick}
			className={
				classes.item + (props.active ? " " + classes.selectedItem : "")
			}
		>
			<ListItemIcon>{Icon && <Icon />}</ListItemIcon>
			<ListItemText
				primary={props.title}
				primaryTypographyProps={typographyProps}
			/>
			{props.expandable ? (
				props.expanded ? (
					<ExpandLess />
				) : (
					<ExpandMore />
				)
			) : (
				false
			)}
			{props.active && <div className={classes.dot} />}
		</MyListItem>
	);
};

export default React.memo(MenuItemJumboReactLight);
