import React, { useCallback } from "react";
import { ListItemIcon, MenuItem, } from "@mui/material";
import { ExportIcon, ResetIcon, TuneIcon } from "../../Icons";
import { Publish as ImportIcon } from "@mui/icons-material";
import PopupMenu from "../../PopupMenu";
import useCCTranslations from "../../../utils/useCCTranslations";
var anchorOrigin = {
    vertical: "bottom",
    horizontal: "center",
};
var transformOrigin = {
    vertical: "top",
    horizontal: "center",
};
var ActionBarMenu = function (props) {
    var anchorEl = props.anchorEl, onClose = props.onClose, toggleSettings = props.toggleSettings, openResetDialog = props.openResetDialog, openExportMenu = props.openExportMenu, handleImport = props.handleImport;
    var toggleSettingsWrap = useCallback(function (evt) {
        toggleSettings(evt);
        onClose();
    }, [toggleSettings, onClose]);
    var openResetDialogWrap = useCallback(function (evt) {
        openResetDialog(evt);
        onClose();
    }, [openResetDialog, onClose]);
    var openExportMenuWrap = useCallback(function (evt) {
        if (openExportMenu)
            openExportMenu(evt);
        onClose();
    }, [openExportMenu, onClose]);
    var handleImportWrap = useCallback(function (evt) {
        if (handleImport)
            handleImport(evt);
        onClose();
    }, [handleImport, onClose]);
    var t = useCCTranslations().t;
    return (React.createElement(PopupMenu, { elevation: 0, anchorEl: anchorEl, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, keepMounted: true, open: !!anchorEl, onClose: onClose },
        React.createElement(MenuItem, { onClick: toggleSettingsWrap },
            React.createElement(ListItemIcon, null,
                React.createElement(TuneIcon, { fontSize: "small" })),
            t("standalone.data-grid.header.settings")),
        React.createElement(MenuItem, { onClick: openResetDialogWrap },
            React.createElement(ListItemIcon, null,
                React.createElement(ResetIcon, { fontSize: "small" })),
            t("standalone.data-grid.header.reset")),
        openExportMenu && (React.createElement(MenuItem, { onClick: openExportMenuWrap },
            React.createElement(ListItemIcon, null,
                React.createElement(ExportIcon, { fontSize: "small" })),
            t("standalone.data-grid.header.export"))),
        handleImport && (React.createElement(MenuItem, { onClick: handleImportWrap },
            React.createElement(ListItemIcon, null,
                React.createElement(ImportIcon, { fontSize: "small" })),
            t("standalone.data-grid.header.import")))));
};
export default React.memo(ActionBarMenu);
