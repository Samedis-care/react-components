import { ListItem, ListItemButton, ListItemIcon, styled } from "@mui/material";

export const SmallListItem = styled(ListItem)({
	"& .MuiListItem-gutters": {
		paddingLeft: 8,
		paddingRight: 8,
	},
}) as typeof ListItem;
export const SmallListItemButton = styled(ListItemButton)({
	"& .MuiListItem-gutters": {
		paddingLeft: 8,
		paddingRight: 8,
	},
}) as typeof ListItemButton;

export const SelectorSmallListItem = styled(ListItem)({
	"& .MuiListItem-gutters": {
		paddingLeft: 0,
		paddingRight: 8,
	},
}) as typeof ListItem;

export const SelectorSmallListItemButton = styled(ListItemButton)({
	"& .MuiListItem-gutters": {
		paddingLeft: 0,
		paddingRight: 8,
	},
}) as typeof ListItemButton;

export const SmallListItemIcon = styled(ListItemIcon)({
	minWidth: 0,
	paddingRight: 8,
}) as typeof ListItemIcon;
