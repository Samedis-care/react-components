import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useMemo } from "react";
import { ListItemIcon, MenuItem, } from "@mui/material";
import { ExportIcon } from "../../Icons";
import { Publish as ImportIcon, Refresh as RefreshIcon, Tune as TuneIcon, } from "@mui/icons-material";
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
    const { anchorEl, onClose, toggleSettings, openResetDialog, openExportMenu, handleImport, slotProps, } = props;
    const menuSlotProps = useMemo(() => {
        if (!slotProps)
            return undefined;
        // the entries are not slots of the Menu
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { resetItem, exportItem, ...menuSlots } = slotProps;
        return menuSlots;
    }, [slotProps]);
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
    return (_jsxs(PopupMenu, { anchorEl: anchorEl, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, keepMounted: true, open: !!anchorEl, onClose: onClose, slotProps: menuSlotProps, children: [toggleSettings && (_jsxs(MenuItem, { onClick: toggleSettingsWrap, children: [_jsx(ListItemIcon, { children: _jsx(TuneIcon, { fontSize: "small" }) }), t("standalone.data-grid.header.settings")] })), openResetDialog && (_jsxs(MenuItem, { ...slotProps?.resetItem, onClick: openResetDialogWrap, children: [_jsx(ListItemIcon, { children: _jsx(RefreshIcon, { fontSize: "small" }) }), t("standalone.data-grid.header.reset")] })), openExportMenu && (_jsxs(MenuItem, { ...slotProps?.exportItem, onClick: openExportMenuWrap, children: [_jsx(ListItemIcon, { children: _jsx(ExportIcon, { fontSize: "small" }) }), t("standalone.data-grid.header.export")] })), handleImport && (_jsxs(MenuItem, { onClick: handleImportWrap, children: [_jsx(ListItemIcon, { children: _jsx(ImportIcon, { fontSize: "small" }) }), t("standalone.data-grid.header.import")] }))] }));
};
export default React.memo(ActionBarMenu);
