import React, { useCallback } from "react";
import { ListItemIcon, MenuItem, } from "@mui/material";
import { ExportIcon, ResetIcon, TuneIcon } from "../../Icons";
import { Publish as ImportIcon } from "@mui/icons-material";
import PopupMenu from "../../PopupMenu";
import useCCTranslations from "../../../utils/useCCTranslations";
const anchorOrigin = {
    vertical: "bottom",
    horizontal: "center",
};
const transformOrigin = {
    vertical: "top",
    horizontal: "center",
};
const ActionBarMenu = (props) => {
    const { anchorEl, onClose, toggleSettings, openResetDialog, openExportMenu, handleImport, } = props;
    const toggleSettingsWrap = useCallback((evt) => {
        toggleSettings(evt);
        onClose();
    }, [toggleSettings, onClose]);
    const openResetDialogWrap = useCallback((evt) => {
        openResetDialog(evt);
        onClose();
    }, [openResetDialog, onClose]);
    const openExportMenuWrap = useCallback((evt) => {
        if (openExportMenu)
            openExportMenu(evt);
        onClose();
    }, [openExportMenu, onClose]);
    const handleImportWrap = useCallback((evt) => {
        if (handleImport)
            handleImport(evt);
        onClose();
    }, [handleImport, onClose]);
    const { t } = useCCTranslations();
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
