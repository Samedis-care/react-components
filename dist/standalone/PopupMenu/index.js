import { Menu } from "@mui/material";
import withStyles from "@mui/styles/withStyles";
var PopupMenu = withStyles(function (theme) { return ({
    paper: {
        border: "1px solid ".concat(theme.palette.divider),
    },
}); })(Menu);
export default PopupMenu;
