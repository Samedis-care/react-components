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
    return (React.createElement(PopupMenu, { elevation: 0, anchorEl: props.anchorEl, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, keepMounted: true, open: !!props.anchorEl, onClose: props.onClose }, props.exporters.map((exporter) => (React.createElement(ExportMenuEntry, { key: exporter.id, exporter: exporter, closeMenu: props.onClose })))));
};
export default React.memo(ExportMenu);
