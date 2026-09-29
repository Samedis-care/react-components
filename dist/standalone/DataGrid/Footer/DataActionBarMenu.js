import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { ListItemIcon, MenuItem, } from "@mui/material";
import PopupMenu from "../../PopupMenu";
import { dataGridIsCustomDataActionDisabled } from "../CallbackUtil";
const anchorOrigin = {
    vertical: "top",
    horizontal: "center",
};
const transformOrigin = {
    vertical: "top",
    horizontal: "center",
};
const DataActionBarMenu = (props) => {
    const { anchorEl, onClose, customButtons, numSelected, selectAll, handleCustomButtonClick, } = props;
    return (_jsx(PopupMenu, { elevation: 0, anchorEl: anchorEl, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, keepMounted: true, open: !!anchorEl, onClose: onClose, children: customButtons.map((entry) => (_jsxs(MenuItem, { disabled: dataGridIsCustomDataActionDisabled(entry, numSelected, selectAll), onClick: () => {
                handleCustomButtonClick(entry.label);
                onClose();
            }, children: [_jsx(ListItemIcon, { children: entry.icon }), entry.label] }, entry.label))) }));
};
export default React.memo(DataActionBarMenu);
