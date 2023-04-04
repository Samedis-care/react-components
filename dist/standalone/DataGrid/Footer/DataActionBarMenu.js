import React from "react";
import { ListItemIcon, MenuItem, } from "@material-ui/core";
import PopupMenu from "../../PopupMenu";
var anchorOrigin = {
    vertical: "top",
    horizontal: "center",
};
var transformOrigin = {
    vertical: "top",
    horizontal: "center",
};
var DataActionBarMenu = function (props) {
    var anchorEl = props.anchorEl, onClose = props.onClose, customButtons = props.customButtons, numSelected = props.numSelected, handleCustomButtonClick = props.handleCustomButtonClick;
    return (React.createElement(PopupMenu, { elevation: 0, anchorEl: anchorEl, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, keepMounted: true, getContentAnchorEl: null, open: !!anchorEl, onClose: onClose }, customButtons.map(function (entry) { return (React.createElement(MenuItem, { key: entry.label, disabled: entry.isDisabled(numSelected), onClick: function () {
            handleCustomButtonClick(entry.label);
            onClose();
        } },
        React.createElement(ListItemIcon, null, entry.icon),
        entry.label)); })));
};
export default React.memo(DataActionBarMenu);
