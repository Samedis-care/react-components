import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import ExportMenuEntry from "./ExportMenuEntry";
import PopupMenu from "../../PopupMenu";
const anchorOrigin = {
    vertical: "bottom",
    horizontal: "center",
};
const transformOrigin = {
    vertical: "top",
    horizontal: "center",
};
const ExportMenu = (props) => {
    return (_jsx(PopupMenu, { elevation: 0, anchorEl: props.anchorEl, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, keepMounted: true, open: !!props.anchorEl, onClose: props.onClose, children: props.exporters.map((exporter) => (_jsx(ExportMenuEntry, { exporter: exporter, closeMenu: props.onClose }, exporter.id))) }));
};
export default React.memo(ExportMenu);
