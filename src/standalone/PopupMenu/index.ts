import { Menu, withStyles } from "@material-ui/core";

const PopupMenu = withStyles((theme) => ({
	paper: {
		border: `1px solid ${theme.palette.divider}`,
	},
}))(Menu);

export default PopupMenu;
