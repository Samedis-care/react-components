import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
        if (toggleSettings)
            toggleSettings(evt);
        onClose();
    }, [toggleSettings, onClose]);
    const openResetDialogWrap = useCallback((evt) => {
        if (openResetDialog)
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
    return (_jsxs(PopupMenu, { elevation: 0, anchorEl: anchorEl, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, keepMounted: true, open: !!anchorEl, onClose: onClose, children: [toggleSettings && (_jsxs(MenuItem, { onClick: toggleSettingsWrap, children: [_jsx(ListItemIcon, { children: _jsx(TuneIcon, { fontSize: "small" }) }), t("standalone.data-grid.header.settings")] })), openResetDialog && (_jsxs(MenuItem, { onClick: openResetDialogWrap, children: [_jsx(ListItemIcon, { children: _jsx(ResetIcon, { fontSize: "small" }) }), t("standalone.data-grid.header.reset")] })), openExportMenu && (_jsxs(MenuItem, { onClick: openExportMenuWrap, children: [_jsx(ListItemIcon, { children: _jsx(ExportIcon, { fontSize: "small" }) }), t("standalone.data-grid.header.export")] })), handleImport && (_jsxs(MenuItem, { onClick: handleImportWrap, children: [_jsx(ListItemIcon, { children: _jsx(ImportIcon, { fontSize: "small" }) }), t("standalone.data-grid.header.import")] }))] }));
};
export default React.memo(ActionBarMenu);
