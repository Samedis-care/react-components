import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useState } from "react";
import { Grid, IconButton, Tooltip, useMediaQuery, useTheme, } from "@mui/material";
import { Add as AddIcon, Menu as MenuIcon, Publish as ImportIcon, } from "@mui/icons-material";
import { ExportIcon, ResetIcon, TuneIcon } from "../../Icons";
import ActionButton from "../../UIKit/ActionButton";
import { SmallestIconButton } from "../../Small";
import VerticalDivider from "../../VerticalDivider";
import ExportMenu from "./ExportMenu";
import ComponentWithLabel from "../../UIKit/ComponentWithLabel";
import ResetMenu from "./ResetMenu";
import useCCTranslations from "../../../utils/useCCTranslations";
import ActionBarMenu from "./ActionBarMenu";
const ActionBarView = (props) => {
    const { toggleSettings, handleAddNew, handleImport, hasCustomFilterBar, exporters, hideReset, 
    // reset callbacks
    refresh, resetFilter, resetSort, resetColumn, resetWidth, resetAll, } = props;
    const theme = useTheme();
    const bpMdUp = useMediaQuery(theme.breakpoints.up("md"), { noSsr: true });
    const bpSmUp = useMediaQuery(theme.breakpoints.up("sm"), { noSsr: true });
    const { t } = useCCTranslations();
    const handleToggleSettings = useCallback((evt) => {
        evt.stopPropagation();
        evt.preventDefault();
        if (toggleSettings)
            toggleSettings();
    }, [toggleSettings]);
    const [exportAnchorEl, setExportAnchorEl] = useState(undefined);
    const openExportMenu = useCallback((evt) => {
        setExportAnchorEl(evt.currentTarget);
    }, [setExportAnchorEl]);
    const closeExportMenu = useCallback(() => {
        setExportAnchorEl(null);
    }, [setExportAnchorEl]);
    const [resetAnchorEl, setResetAnchorEl] = useState(undefined);
    const openResetDialog = useCallback((evt) => {
        setResetAnchorEl(evt.currentTarget);
    }, []);
    const closeResetMenu = useCallback(() => {
        setResetAnchorEl(null);
    }, []);
    const [settingsAnchorEl, setSettingsAnchorEl] = useState(undefined);
    const openSettingsMenu = useCallback((evt) => {
        setSettingsAnchorEl(evt.currentTarget);
    }, []);
    const closeSettingsMenu = useCallback(() => {
        setSettingsAnchorEl(undefined);
    }, []);
    const addButtons = Array.isArray(handleAddNew)
        ? handleAddNew
        : handleAddNew == null
            ? []
            : [
                {
                    icon: undefined,
                    label: t("standalone.data-grid.header.new") ?? "",
                    onClick: typeof handleAddNew === "function" ? handleAddNew : undefined,
                    disableHint: typeof handleAddNew === "string" ? handleAddNew : undefined,
                },
            ];
    return (_jsxs(Grid, { container: true, sx: { alignItems: "stretch" }, wrap: "nowrap", children: [hasCustomFilterBar &&
                !bpSmUp &&
                (toggleSettings || !hideReset || exporters || handleImport) ? (_jsxs(_Fragment, { children: [_jsx(Grid, { children: _jsx(VerticalDivider, {}) }, "divider-1"), _jsx(IconButton, { color: "primary", onClick: openSettingsMenu, size: "large", "aria-label": t("standalone.data-grid.header.more-options"), children: _jsx(MenuIcon, {}) }), _jsx(ActionBarMenu, { anchorEl: settingsAnchorEl, toggleSettings: toggleSettings, openResetDialog: hideReset ? undefined : openResetDialog, openExportMenu: exporters ? openExportMenu : undefined, handleImport: handleImport, onClose: closeSettingsMenu })] })) : (_jsxs(_Fragment, { children: [toggleSettings && (_jsxs(_Fragment, { children: [hasCustomFilterBar && (_jsx(Grid, { children: _jsx(VerticalDivider, {}) }, "divider-1")), _jsx(Grid, { children: bpMdUp ? (_jsx(ComponentWithLabel, { control: _jsx(SmallestIconButton, { color: "primary", "aria-label": t("standalone.data-grid.header.settings"), children: _jsx(TuneIcon, {}) }), labelText: t("standalone.data-grid.header.settings"), onClick: handleToggleSettings, labelPlacement: "bottom" })) : (_jsx(Tooltip, { title: t("standalone.data-grid.header.settings"), children: _jsx(IconButton, { color: "primary", onClick: handleToggleSettings, size: "large", "aria-label": t("standalone.data-grid.header.settings"), children: _jsx(TuneIcon, {}) }) })) }, "settings")] })), !hideReset && (_jsxs(_Fragment, { children: [_jsx(Grid, { children: _jsx(VerticalDivider, {}) }, "divider-4"), _jsx(Grid, { children: bpMdUp ? (_jsx(ComponentWithLabel, { control: _jsx(SmallestIconButton, { color: "primary", "aria-label": t("standalone.data-grid.header.reset"), children: _jsx(ResetIcon, {}) }), labelText: t("standalone.data-grid.header.reset"), onClick: openResetDialog, labelPlacement: "bottom" })) : (_jsx(Tooltip, { title: t("standalone.data-grid.header.reset"), children: _jsx(IconButton, { color: "primary", onClick: openResetDialog, size: "large", "aria-label": t("standalone.data-grid.header.reset"), children: _jsx(ResetIcon, {}) }) })) }, "reset")] })), exporters && (_jsxs(_Fragment, { children: [_jsx(Grid, { children: _jsx(VerticalDivider, {}) }, "divider-3"), _jsxs(Grid, { children: [bpMdUp ? (_jsx(ComponentWithLabel, { control: _jsx(SmallestIconButton, { color: "primary", "aria-label": t("standalone.data-grid.header.export"), children: _jsx(ExportIcon, {}) }), labelText: t("standalone.data-grid.header.export"), onClick: openExportMenu, labelPlacement: "bottom" })) : (_jsx(Tooltip, { title: t("standalone.data-grid.header.export"), children: _jsx(IconButton, { color: "primary", onClick: openExportMenu, size: "large", "aria-label": t("standalone.data-grid.header.export"), children: _jsx(ExportIcon, {}) }) })), _jsx(ExportMenu, { exporters: exporters, anchorEl: exportAnchorEl, onClose: closeExportMenu })] }, "export")] })), handleImport && (_jsxs(_Fragment, { children: [_jsx(Grid, { children: _jsx(VerticalDivider, {}) }), _jsx(Grid, { children: bpMdUp ? (_jsx(ComponentWithLabel, { control: _jsx(SmallestIconButton, { color: "primary", "aria-label": t("standalone.data-grid.header.import"), children: _jsx(ImportIcon, {}) }), labelText: t("standalone.data-grid.header.import"), onClick: handleImport, labelPlacement: "bottom" })) : (_jsx(Tooltip, { title: t("standalone.data-grid.header.import"), children: _jsx(IconButton, { color: "primary", onClick: handleImport, size: "large", "aria-label": t("standalone.data-grid.header.import"), children: _jsx(ImportIcon, {}) }) })) }, "import")] }))] })), addButtons.length > 0 && (_jsxs(_Fragment, { children: [_jsx(Grid, { size: "grow" }, "divider-2"), _jsx(Grid, { container: true, sx: { justifyContent: "flex-end", alignItems: "center" }, spacing: 2, wrap: "nowrap", children: addButtons.map((entry, index) => {
                            const btn = (_jsx(ActionButton, { small: !bpSmUp, icon: entry.icon ?? _jsx(AddIcon, {}), onClick: entry.onClick, disabled: !entry.onClick, children: entry.label }));
                            return (_jsx(Grid, { children: !entry.onClick && entry.disableHint ? (_jsx(Tooltip, { title: entry.disableHint, children: _jsx("span", { children: btn }) })) : (btn) }, index.toString()));
                        }) }, "new")] })), _jsx(ResetMenu, { anchorEl: resetAnchorEl, onClose: closeResetMenu, refresh: refresh, resetFilter: resetFilter, resetSort: resetSort, resetColumn: resetColumn, resetWidth: resetWidth, resetAll: resetAll })] }));
};
export default React.memo(ActionBarView);
