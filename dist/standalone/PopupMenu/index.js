import { Menu, withStyles } from "@material-ui/core";
var PopupMenu = withStyles(function (theme) { return ({
    paper: {
        border: "1px solid ".concat(theme.palette.divider),
    },
}); })(Menu);
export default PopupMenu;
