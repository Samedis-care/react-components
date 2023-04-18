import React from "react";
import { ListItemButton, ListItemIcon, ListItemText, } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import makeStyles from "@mui/styles/makeStyles";
import { combineClassNames } from "../../../../../utils";
var useStyles = makeStyles(function (theme) { return ({
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
}); }, { name: "CcPortalMenuItemLight" });
var selectedListItemStyles = createStyles(function (theme) { return ({
    button: {
        "&:hover": {
            backgroundColor: theme.palette.primary.main,
        },
    },
}); });
var unselectedListItemStyles = createStyles(function (theme) { return ({
    button: {
        "&:hover": {
            color: theme.palette.primary.main,
            backgroundColor: "transparent",
        },
    },
}); });
var expandableListItemStyles = createStyles({
    button: {
        "&:hover": {
            backgroundColor: "transparent",
        },
    },
});
var SelectedListItem = withStyles(selectedListItemStyles)(ListItemButton);
var UnselectedListItem = withStyles(unselectedListItemStyles)(ListItemButton);
var ExpandableListItem = withStyles(expandableListItemStyles)(ListItemButton);
var typographyProps = { variant: "body2" };
var MenuItemJumboReactLight = function (props) {
    var classes = useStyles();
    var Icon = props.icon;
    var MyListItem = (props.expandable
        ? ExpandableListItem
        : props.active
            ? SelectedListItem
            : UnselectedListItem);
    return (React.createElement(MyListItem, { onClick: props.onClick, onAuxClick: props.onAuxClick, className: combineClassNames([
            classes.item,
            props.active && classes.selectedItem,
        ]) },
        React.createElement(ListItemIcon, null, Icon && React.createElement(Icon, null)),
        React.createElement(ListItemText, { primary: props.title, primaryTypographyProps: typographyProps }),
        props.expandable && (props.expanded ? React.createElement(ExpandLess, null) : React.createElement(ExpandMore, null)),
        props.active && React.createElement("div", { className: classes.dot })));
};
export default React.memo(MenuItemJumboReactLight);
