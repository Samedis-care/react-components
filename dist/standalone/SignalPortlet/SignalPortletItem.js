import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import makeStyles from "@mui/styles/makeStyles";
import { Avatar, ListItem, ListItemAvatar, ListItemButton, ListItemText, } from "@mui/material";
import Loader from "../Loader";
const useStyles = makeStyles((theme) => ({
    itemColorLoading: {
        backgroundColor: "transparent",
    },
    itemColorActive: (props) => ({
        color: theme.palette.getContrastText(props.colorPresent),
        backgroundColor: props.colorPresent,
    }),
    itemColorInactive: (props) => ({
        color: theme.palette.getContrastText(props.colorNotPresent),
        backgroundColor: props.colorNotPresent,
    }),
    root: {},
    listAvatar: {},
    listText: {},
}), { name: "CcSignalPortletItem" });
const SignalPortletItem = (props) => {
    const { count, link, text } = props;
    const classes = useStyles(props);
    const navigate = useNavigate();
    const handleClick = useCallback(() => {
        if (link) {
            navigate(link);
        }
    }, [navigate, link]);
    const counterClass = count == null
        ? classes.itemColorLoading
        : count
            ? classes.itemColorActive
            : classes.itemColorInactive;
    const content = (React.createElement(React.Fragment, null,
        React.createElement(ListItemAvatar, { className: classes.listAvatar },
            React.createElement(Avatar, { className: counterClass }, count == null ? React.createElement(Loader, null) : count.toString())),
        React.createElement(ListItemText, { className: classes.listText }, text)));
    return link ? (React.createElement(ListItemButton, { onClick: handleClick, className: classes.root }, content)) : (React.createElement(ListItem, { className: classes.root }, content));
};
export default React.memo(SignalPortletItem);
