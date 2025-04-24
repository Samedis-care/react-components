import { Menu, styled } from "@mui/material";

export type PopupMenuClassKey = "root";
const PopupMenu = styled(Menu, { name: "CcPopupMenu", slot: "root" })(
	({ theme }) => ({
		"& .MuiMenu-paper": {
			border: `1px solid ${theme.palette.divider}`,
		},
	}),
) as typeof Menu;

export default PopupMenu;
