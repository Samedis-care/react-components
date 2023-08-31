import React from "react";
import { ListItemIcon, MenuItem, } from "@mui/material";
import PopupMenu from "../../PopupMenu";
const anchorOrigin = {
    vertical: "top",
    horizontal: "center",
};
const transformOrigin = {
    vertical: "top",
    horizontal: "center",
};
const DataActionBarMenu = (props) => {
    const { anchorEl, onClose, customButtons, numSelected, handleCustomButtonClick, } = props;
    return (React.createElement(PopupMenu, { elevation: 0, anchorEl: anchorEl, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, keepMounted: true, open: !!anchorEl, onClose: onClose }, customButtons.map((entry) => (React.createElement(MenuItem, { key: entry.label, disabled: entry.isDisabled(numSelected), onClick: () => {
            handleCustomButtonClick(entry.label);
            onClose();
        } },
        React.createElement(ListItemIcon, null, entry.icon),
        entry.label)))));
};
export default React.memo(DataActionBarMenu);
