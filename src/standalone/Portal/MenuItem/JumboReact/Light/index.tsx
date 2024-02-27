import React from "react";
import { MenuItemProps } from "../../../Menu";
import {
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Theme,
	TypographyProps,
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import makeStyles from "@mui/styles/makeStyles";
import { combineClassNames } from "../../../../../utils";

const useStyles = makeStyles(
	(theme) => ({
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
			backgroundColor: theme.palette.getContrastText(
				theme.palette.primary.main
			),
			borderRadius: "50%",
			top: "50%",
		},
	}),
	{ name: "CcPortalMenuItemLight" }
);

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

const SelectedListItem = withStyles(selectedListItemStyles)(ListItemButton);
const UnselectedListItem = withStyles(unselectedListItemStyles)(ListItemButton);
const ExpandableListItem = withStyles(expandableListItemStyles)(ListItemButton);

const typographyProps: Pick<TypographyProps, "variant"> = { variant: "body2" };

const MenuItemJumboReactLight = (props: MenuItemProps) => {
	const classes = useStyles();

	const Icon = props.icon;

	const MyListItem = (props.expandable
		? ExpandableListItem
		: props.active
		? SelectedListItem
		: UnselectedListItem) as typeof ListItemButton;

	return (
		<MyListItem
			onClick={props.onClick}
			onAuxClick={props.onAuxClick}
			className={combineClassNames([
				classes.item,
				props.active && classes.selectedItem,
			])}
		>
			<ListItemIcon>{Icon && <Icon />}</ListItemIcon>
			<ListItemText
				primary={props.title}
				primaryTypographyProps={typographyProps}
			/>
			{props.expandable && (props.expanded ? <ExpandLess /> : <ExpandMore />)}
			{props.active && <div className={classes.dot} />}
		</MyListItem>
	);
};

export default React.memo(MenuItemJumboReactLight);
