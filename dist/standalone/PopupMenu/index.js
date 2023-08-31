import { Menu } from "@mui/material";
import withStyles from "@mui/styles/withStyles";
const PopupMenu = withStyles((theme) => ({
    paper: {
        border: `1px solid ${theme.palette.divider}`,
    },
}))(Menu);
export default PopupMenu;
