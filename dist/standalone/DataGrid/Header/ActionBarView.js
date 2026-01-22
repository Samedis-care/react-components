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
    return (React.createElement(Grid, { container: true, alignItems: "stretch", wrap: "nowrap" },
        hasCustomFilterBar &&
            !bpSmUp &&
            (toggleSettings || !hideReset || exporters || handleImport) ? (React.createElement(React.Fragment, null,
            React.createElement(Grid, { key: "divider-1" },
                React.createElement(VerticalDivider, null)),
            React.createElement(IconButton, { color: "primary", onClick: openSettingsMenu, size: "large" },
                React.createElement(MenuIcon, null)),
            React.createElement(ActionBarMenu, { anchorEl: settingsAnchorEl, toggleSettings: toggleSettings, openResetDialog: hideReset ? undefined : openResetDialog, openExportMenu: exporters ? openExportMenu : undefined, handleImport: handleImport, onClose: closeSettingsMenu }))) : (React.createElement(React.Fragment, null,
            toggleSettings && (React.createElement(React.Fragment, null,
                hasCustomFilterBar && (React.createElement(Grid, { key: "divider-1" },
                    React.createElement(VerticalDivider, null))),
                React.createElement(Grid, { key: "settings" }, bpMdUp ? (React.createElement(ComponentWithLabel, { control: React.createElement(SmallestIconButton, { color: "primary" },
                        React.createElement(TuneIcon, null)), labelText: t("standalone.data-grid.header.settings"), onClick: handleToggleSettings, labelPlacement: "bottom" })) : (React.createElement(Tooltip, { title: t("standalone.data-grid.header.settings") ?? "" },
                    React.createElement(IconButton, { color: "primary", onClick: handleToggleSettings, size: "large" },
                        React.createElement(TuneIcon, null))))))),
            !hideReset && (React.createElement(React.Fragment, null,
                React.createElement(Grid, { key: "divider-4" },
                    React.createElement(VerticalDivider, null)),
                React.createElement(Grid, { key: "reset" }, bpMdUp ? (React.createElement(ComponentWithLabel, { control: React.createElement(SmallestIconButton, { color: "primary" },
                        React.createElement(ResetIcon, null)), labelText: t("standalone.data-grid.header.reset"), onClick: openResetDialog, labelPlacement: "bottom" })) : (React.createElement(Tooltip, { title: t("standalone.data-grid.header.reset") ?? "" },
                    React.createElement(IconButton, { color: "primary", onClick: openResetDialog, size: "large" },
                        React.createElement(ResetIcon, null))))))),
            exporters && (React.createElement(React.Fragment, null,
                React.createElement(Grid, { key: "divider-3" },
                    React.createElement(VerticalDivider, null)),
                React.createElement(Grid, { key: "export" },
                    bpMdUp ? (React.createElement(ComponentWithLabel, { control: React.createElement(SmallestIconButton, { color: "primary" },
                            React.createElement(ExportIcon, null)), labelText: t("standalone.data-grid.header.export"), onClick: openExportMenu, labelPlacement: "bottom" })) : (React.createElement(Tooltip, { title: t("standalone.data-grid.header.export") ?? "" },
                        React.createElement(IconButton, { color: "primary", onClick: openExportMenu, size: "large" },
                            React.createElement(ExportIcon, null)))),
                    React.createElement(ExportMenu, { exporters: exporters, anchorEl: exportAnchorEl, onClose: closeExportMenu })))),
            handleImport && (React.createElement(React.Fragment, null,
                React.createElement(Grid, null,
                    React.createElement(VerticalDivider, null)),
                React.createElement(Grid, { key: "import" }, bpMdUp ? (React.createElement(ComponentWithLabel, { control: React.createElement(SmallestIconButton, { color: "primary" },
                        React.createElement(ImportIcon, null)), labelText: t("standalone.data-grid.header.import"), onClick: handleImport, labelPlacement: "bottom" })) : (React.createElement(Tooltip, { title: t("standalone.data-grid.header.import") ?? "" },
                    React.createElement(IconButton, { color: "primary", onClick: handleImport, size: "large" },
                        React.createElement(ImportIcon, null))))))))),
        addButtons.length > 0 && (React.createElement(React.Fragment, null,
            React.createElement(Grid, { key: "divider-2", size: "grow" }),
            React.createElement(Grid, { container: true, key: "new", justifyContent: "flex-end", alignItems: "center", spacing: 2, wrap: "nowrap" }, addButtons.map((entry, index) => {
                const btn = (React.createElement(ActionButton, { small: !bpSmUp, icon: entry.icon ?? React.createElement(AddIcon, null), onClick: entry.onClick, disabled: !entry.onClick }, entry.label));
                return (React.createElement(Grid, { key: index.toString() }, !entry.onClick && entry.disableHint ? (React.createElement(Tooltip, { title: entry.disableHint },
                    React.createElement("span", null, btn))) : (btn)));
            })))),
        React.createElement(ResetMenu, { anchorEl: resetAnchorEl, onClose: closeResetMenu, refresh: refresh, resetFilter: resetFilter, resetSort: resetSort, resetColumn: resetColumn, resetWidth: resetWidth, resetAll: resetAll })));
};
export default React.memo(ActionBarView);
