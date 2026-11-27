import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { styled } from "@mui/material";
import ExportMenuEntry from "./ExportMenuEntry";
import PopupMenu from "../../PopupMenu";
import visuallyHidden from "../../../utils/internal/visuallyHidden";
const anchorOrigin = {
    vertical: "bottom",
    horizontal: "center",
};
const transformOrigin = {
    vertical: "top",
    horizontal: "center",
};
// holds each entry's status region outside the menu (see ExportMenuEntry)
const ExportStatusContainer = styled("span")(visuallyHidden);
const ExportMenu = (props) => {
    const [statusContainer, setStatusContainer] = useState(null);
    return (_jsxs(_Fragment, { children: [_jsx(ExportStatusContainer, { ref: setStatusContainer }), _jsx(PopupMenu, { anchorEl: props.anchorEl, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, keepMounted: true, open: !!props.anchorEl, onClose: props.onClose, slotProps: props.slotProps, children: props.exporters.map((exporter) => (_jsx(ExportMenuEntry, { exporter: exporter, closeMenu: props.onClose, statusContainer: statusContainer }, exporter.id))) })] }));
};
export default React.memo(ExportMenu);
