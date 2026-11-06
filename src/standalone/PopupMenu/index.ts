import { Menu, menuItemClasses, styled } from "@mui/material";

export type PopupMenuClassKey = "root";
const PopupMenu = styled(Menu, { name: "CcPopupMenu", slot: "root" })(
	({ theme }) => ({
		"& .MuiMenu-paper": {
			border: `1px solid ${theme.palette.divider}`,
		},
		// MUI marks the keyboard-focused item with a faint tint only, which forced colors
		// drop; inset, because the paper clips the item's sides
		[`& .${menuItemClasses.root}.${menuItemClasses.focusVisible}`]: {
			outline: `2px solid ${theme.palette.primary.main}`,
			outlineOffset: -2,
		},
	}),
) as typeof Menu;

export default PopupMenu;
