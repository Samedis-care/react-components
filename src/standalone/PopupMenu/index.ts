import { Menu, Theme } from "@mui/material";

import withStyles from "@mui/styles/withStyles";

const PopupMenu = withStyles((theme: Theme) => ({
	paper: {
		border: `1px solid ${theme.palette.divider}`,
	},
}))(Menu);

export default PopupMenu;
