import React from "react";
import ExportMenuEntry from "./ExportMenuEntry";
import PopupMenu from "../../PopupMenu";
var anchorOrigin = {
    vertical: "bottom",
    horizontal: "center",
};
var transformOrigin = {
    vertical: "top",
    horizontal: "center",
};
var ExportMenu = function (props) {
    return (React.createElement(PopupMenu, { elevation: 0, anchorEl: props.anchorEl, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, keepMounted: true, open: !!props.anchorEl, onClose: props.onClose }, props.exporters.map(function (exporter) { return (React.createElement(ExportMenuEntry, { key: exporter.id, exporter: exporter })); })));
};
export default React.memo(ExportMenu);
