import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import makeStyles from "@mui/styles/makeStyles";
import { Avatar, ListItem, ListItemAvatar, ListItemButton, ListItemText, } from "@mui/material";
import Loader from "../Loader";
var useStyles = makeStyles(function (theme) { return ({
    itemColorLoading: {
        backgroundColor: "transparent",
    },
    itemColorActive: function (props) { return ({
        color: theme.palette.getContrastText(props.colorPresent),
        backgroundColor: props.colorPresent,
    }); },
    itemColorInactive: function (props) { return ({
        color: theme.palette.getContrastText(props.colorNotPresent),
        backgroundColor: props.colorNotPresent,
    }); },
    root: {},
    listAvatar: {},
    listText: {},
}); }, { name: "CcSignalPortletItem" });
var SignalPortletItem = function (props) {
    var count = props.count, link = props.link, text = props.text;
    var classes = useStyles(props);
    var navigate = useNavigate();
    var handleClick = useCallback(function () {
        if (link) {
            navigate(link);
        }
    }, [navigate, link]);
    var counterClass = count == null
        ? classes.itemColorLoading
        : count
            ? classes.itemColorActive
            : classes.itemColorInactive;
    var content = (React.createElement(React.Fragment, null,
        React.createElement(ListItemAvatar, { className: classes.listAvatar },
            React.createElement(Avatar, { className: counterClass }, count == null ? React.createElement(Loader, null) : count.toString())),
        React.createElement(ListItemText, { className: classes.listText }, text)));
    return link ? (React.createElement(ListItemButton, { onClick: handleClick, className: classes.root }, content)) : (React.createElement(ListItem, { className: classes.root }, content));
};
export default React.memo(SignalPortletItem);
