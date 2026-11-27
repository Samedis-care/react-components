import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Grid, Tooltip, useMediaQuery, useTheme, } from "@mui/material";
import { Add as AddIcon, Menu as MenuIcon, Publish as ImportIcon, Refresh as RefreshIcon, Tune as TuneIcon, } from "@mui/icons-material";
import { ExportIcon } from "../../Icons";
import ActionButton from "../../UIKit/ActionButton";
import { SmallestIconButton } from "../../Small";
import VerticalDivider from "../../VerticalDivider";
import ExportMenu from "./ExportMenu";
import ComponentWithLabel from "../../UIKit/ComponentWithLabel";
import ResetMenu from "./ResetMenu";
import useCCTranslations from "../../../utils/useCCTranslations";
import ActionBarMenu from "./ActionBarMenu";
import useMenuButton from "../../../utils/internal/useMenuButton";
import HeaderIconButton from "./HeaderIconButton";
/** No add buttons in More options (wider screens) */
const NO_ADD_BUTTONS = [];
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
    const moreOptionsRef = useRef(null);
    // from the phone's "More options" menu: anchored to its button, as the
    // menu's entry closes with that menu
    const openExportMenuFromMoreOptions = useCallback(() => {
        setExportAnchorEl(moreOptionsRef.current);
    }, []);
    const [resetAnchorEl, setResetAnchorEl] = useState(undefined);
    const openResetDialog = useCallback((evt) => {
        setResetAnchorEl(evt.currentTarget);
    }, []);
    const closeResetMenu = useCallback(() => {
        setResetAnchorEl(null);
    }, []);
    // from the phone's "More options" menu: anchored to its button, as the
    // menu's entry closes with that menu
    const openResetDialogFromMoreOptions = useCallback(() => {
        setResetAnchorEl(moreOptionsRef.current);
    }, []);
    const [settingsAnchorEl, setSettingsAnchorEl] = useState(undefined);
    const openSettingsMenu = useCallback((evt) => {
        setSettingsAnchorEl(evt.currentTarget);
    }, []);
    const closeSettingsMenu = useCallback(() => {
        setSettingsAnchorEl(undefined);
    }, []);
    // on phones with "More options" (see showMoreOptions), its "Reset" and
    // "Export" entries open the reset and export menus instead of the buttons
    const moreOptionsMenu = useMenuButton(!!settingsAnchorEl);
    const resetMenu = useMenuButton(!!resetAnchorEl);
    const exportMenu = useMenuButton(!!exportAnchorEl);
    const moreOptionsSlotProps = useMemo(() => ({
        ...moreOptionsMenu.slotProps,
        resetItem: resetMenu.buttonProps,
        exportItem: exportMenu.buttonProps,
    }), [moreOptionsMenu.slotProps, resetMenu.buttonProps, exportMenu.buttonProps]);
    const addButtons = useMemo(() => Array.isArray(handleAddNew)
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
            ], [handleAddNew, t]);
    // on phones the header holds only the first add button, the others are
    // entries of "More options"
    const headerAddButtons = bpSmUp ? addButtons : addButtons.slice(0, 1);
    const menuAddButtons = useMemo(() => (bpSmUp ? NO_ADD_BUTTONS : addButtons.slice(1)), [bpSmUp, addButtons]);
    // "Columns", "Reset", "Export" and "Import"
    const numButtons = [
        toggleSettings,
        !hideReset,
        exporters,
        handleImport,
    ].filter(Boolean).length;
    // On phones "More options" holds "Columns", "Reset", "Export" and "Import"
    // where they don't fit: beside a filter bar, beside a second add button
    // (in the menu too), or more than two of them beside an add button. A
    // 320px phone fits Search, two of them and an add button, or all four.
    const showMoreOptions = !bpSmUp &&
        (numButtons > 0 || menuAddButtons.length > 0) &&
        (hasCustomFilterBar ||
            menuAddButtons.length > 0 ||
            (addButtons.length > 0 && numButtons > 2));
    return (_jsxs(Grid, { container: true, sx: { alignItems: "stretch" }, wrap: "nowrap", children: [showMoreOptions ? (_jsxs(_Fragment, { children: [hasCustomFilterBar && (_jsx(Grid, { children: _jsx(VerticalDivider, {}) }, "divider-1")), _jsx(HeaderIconButton, { ref: moreOptionsRef, ...moreOptionsMenu.buttonProps, color: "primary", onClick: openSettingsMenu, size: "large", "aria-label": t("standalone.data-grid.header.more-options"), children: _jsx(MenuIcon, {}) }), _jsx(ActionBarMenu, { anchorEl: settingsAnchorEl, toggleSettings: toggleSettings, openResetDialog: hideReset ? undefined : openResetDialogFromMoreOptions, openExportMenu: exporters ? openExportMenuFromMoreOptions : undefined, handleImport: handleImport, addButtons: menuAddButtons, onClose: closeSettingsMenu, slotProps: moreOptionsSlotProps })] })) : (_jsxs(_Fragment, { children: [toggleSettings && (_jsxs(_Fragment, { children: [hasCustomFilterBar && (_jsx(Grid, { children: _jsx(VerticalDivider, {}) }, "divider-1")), _jsx(Grid, { children: bpMdUp ? (_jsx(ComponentWithLabel, { control: _jsx(SmallestIconButton, { color: "primary", "aria-label": t("standalone.data-grid.header.settings"), children: _jsx(TuneIcon, {}) }), labelText: t("standalone.data-grid.header.settings"), onClick: handleToggleSettings, labelPlacement: "bottom" })) : (_jsx(Tooltip, { title: t("standalone.data-grid.header.settings"), children: _jsx(HeaderIconButton, { color: "primary", onClick: handleToggleSettings, size: "large", "aria-label": t("standalone.data-grid.header.settings"), children: _jsx(TuneIcon, {}) }) })) }, "settings")] })), !hideReset && (_jsxs(_Fragment, { children: [_jsx(Grid, { children: _jsx(VerticalDivider, {}) }, "divider-4"), _jsx(Grid, { children: bpMdUp ? (_jsx(ComponentWithLabel, { control: _jsx(SmallestIconButton, { ...resetMenu.buttonProps, color: "primary", "aria-label": t("standalone.data-grid.header.reset"), children: _jsx(RefreshIcon, {}) }), labelText: t("standalone.data-grid.header.reset"), onClick: openResetDialog, labelPlacement: "bottom" })) : (_jsx(Tooltip, { title: t("standalone.data-grid.header.reset"), children: _jsx(HeaderIconButton, { ...resetMenu.buttonProps, color: "primary", onClick: openResetDialog, size: "large", "aria-label": t("standalone.data-grid.header.reset"), children: _jsx(RefreshIcon, {}) }) })) }, "reset")] })), exporters && (_jsxs(_Fragment, { children: [_jsx(Grid, { children: _jsx(VerticalDivider, {}) }, "divider-3"), _jsx(Grid, { children: bpMdUp ? (_jsx(ComponentWithLabel, { control: _jsx(SmallestIconButton, { ...exportMenu.buttonProps, color: "primary", "aria-label": t("standalone.data-grid.header.export"), children: _jsx(ExportIcon, {}) }), labelText: t("standalone.data-grid.header.export"), onClick: openExportMenu, labelPlacement: "bottom" })) : (_jsx(Tooltip, { title: t("standalone.data-grid.header.export"), children: _jsx(HeaderIconButton, { ...exportMenu.buttonProps, color: "primary", onClick: openExportMenu, size: "large", "aria-label": t("standalone.data-grid.header.export"), children: _jsx(ExportIcon, {}) }) })) }, "export")] })), handleImport && (_jsxs(_Fragment, { children: [_jsx(Grid, { children: _jsx(VerticalDivider, {}) }), _jsx(Grid, { children: bpMdUp ? (_jsx(ComponentWithLabel, { control: _jsx(SmallestIconButton, { color: "primary", "aria-label": t("standalone.data-grid.header.import"), children: _jsx(ImportIcon, {}) }), labelText: t("standalone.data-grid.header.import"), onClick: handleImport, labelPlacement: "bottom" })) : (_jsx(Tooltip, { title: t("standalone.data-grid.header.import"), children: _jsx(HeaderIconButton, { color: "primary", onClick: handleImport, size: "large", "aria-label": t("standalone.data-grid.header.import"), children: _jsx(ImportIcon, {}) }) })) }, "import")] }))] })), headerAddButtons.length > 0 && (_jsxs(_Fragment, { children: [_jsx(Grid, { size: "grow" }, "divider-2"), _jsx(Grid, { container: true, sx: { justifyContent: "flex-end", alignItems: "center" }, spacing: 2, wrap: "nowrap", children: headerAddButtons.map((entry, index) => {
                            const btn = (_jsx(ActionButton, { small: !bpSmUp, icon: entry.icon ?? _jsx(AddIcon, {}), onClick: entry.onClick, disabled: !entry.onClick, children: entry.label }));
                            return (_jsx(Grid, { children: !entry.onClick && entry.disableHint ? (_jsx(Tooltip, { title: entry.disableHint, children: _jsx("span", { children: btn }) })) : (btn) }, index.toString()));
                        }) }, "new")] })), exporters && (_jsx(ExportMenu, { exporters: exporters, anchorEl: exportAnchorEl, onClose: closeExportMenu, slotProps: exportMenu.slotProps })), _jsx(ResetMenu, { anchorEl: resetAnchorEl, onClose: closeResetMenu, slotProps: resetMenu.slotProps, refresh: refresh, resetFilter: resetFilter, resetSort: resetSort, resetColumn: resetColumn, resetWidth: resetWidth, resetAll: resetAll })] }));
};
export default React.memo(ActionBarView);
