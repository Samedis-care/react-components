import React, { useCallback, useState } from "react";
import { Grid, IconButton, Tooltip, useMediaQuery, useTheme, } from "@mui/material";
import { Add as AddIcon, Publish as ImportIcon, Menu as MenuIcon, } from "@mui/icons-material";
import { ActionButton, ExportIcon, ResetIcon, SmallIconButton, TuneIcon, VerticalDivider, } from "../../index";
import ExportMenu from "./ExportMenu";
import ComponentWithLabel from "../../UIKit/ComponentWithLabel";
import ResetMenu from "./ResetMenu";
import useCCTranslations from "../../../utils/useCCTranslations";
import ActionBarMenu from "./ActionBarMenu";
const ActionBarView = (props) => {
    const theme = useTheme();
    const bpMdUp = useMediaQuery(theme.breakpoints.up("md"), { noSsr: true });
    const bpSmUp = useMediaQuery(theme.breakpoints.up("sm"), { noSsr: true });
    const { t } = useCCTranslations();
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
    const addButtons = Array.isArray(props.handleAddNew)
        ? props.handleAddNew
        : props.handleAddNew == null
            ? []
            : [
                {
                    icon: undefined,
                    label: t("standalone.data-grid.header.new") ?? "",
                    onClick: typeof props.handleAddNew === "function"
                        ? props.handleAddNew
                        : undefined,
                    disableHint: typeof props.handleAddNew === "string"
                        ? props.handleAddNew
                        : undefined,
                },
            ];
    return (React.createElement(Grid, { container: true, alignItems: "stretch", wrap: "nowrap" },
        props.hasCustomFilterBar && (React.createElement(Grid, { item: true, key: "divider-1" },
            React.createElement(VerticalDivider, null))),
        props.hasCustomFilterBar && !bpSmUp ? (React.createElement(React.Fragment, null,
            React.createElement(IconButton, { color: "primary", onClick: openSettingsMenu, size: "large" },
                React.createElement(MenuIcon, null)),
            React.createElement(ActionBarMenu, { anchorEl: settingsAnchorEl, toggleSettings: props.toggleSettings, openResetDialog: openResetDialog, openExportMenu: props.exporters ? openExportMenu : undefined, handleImport: props.handleImport, onClose: closeSettingsMenu }))) : (React.createElement(React.Fragment, null,
            React.createElement(Grid, { item: true, key: "settings" }, bpMdUp ? (React.createElement(ComponentWithLabel, { control: React.createElement(SmallIconButton, { color: "primary" },
                    React.createElement(TuneIcon, null)), labelText: t("standalone.data-grid.header.settings"), onClick: props.toggleSettings, labelPlacement: "bottom" })) : (React.createElement(Tooltip, { title: t("standalone.data-grid.header.settings") ?? "" },
                React.createElement(IconButton, { color: "primary", onClick: props.toggleSettings, size: "large" },
                    React.createElement(TuneIcon, null))))),
            React.createElement(Grid, { item: true, key: "divider-4" },
                React.createElement(VerticalDivider, null)),
            React.createElement(Grid, { item: true, key: "reset" }, bpMdUp ? (React.createElement(ComponentWithLabel, { control: React.createElement(SmallIconButton, { color: "primary" },
                    React.createElement(ResetIcon, null)), labelText: t("standalone.data-grid.header.reset"), onClick: openResetDialog, labelPlacement: "bottom" })) : (React.createElement(Tooltip, { title: t("standalone.data-grid.header.reset") ?? "" },
                React.createElement(IconButton, { color: "primary", onClick: openResetDialog, size: "large" },
                    React.createElement(ResetIcon, null))))),
            props.exporters && (React.createElement(React.Fragment, null,
                React.createElement(Grid, { item: true, key: "divider-3" },
                    React.createElement(VerticalDivider, null)),
                React.createElement(Grid, { item: true, key: "export" },
                    bpMdUp ? (React.createElement(ComponentWithLabel, { control: React.createElement(SmallIconButton, { color: "primary" },
                            React.createElement(ExportIcon, null)), labelText: t("standalone.data-grid.header.export"), onClick: openExportMenu, labelPlacement: "bottom" })) : (React.createElement(Tooltip, { title: t("standalone.data-grid.header.export") ?? "" },
                        React.createElement(IconButton, { color: "primary", onClick: openExportMenu, size: "large" },
                            React.createElement(ExportIcon, null)))),
                    React.createElement(ExportMenu, { exporters: props.exporters, anchorEl: exportAnchorEl, onClose: closeExportMenu })))),
            props.handleImport && (React.createElement(React.Fragment, null,
                React.createElement(Grid, { item: true },
                    React.createElement(VerticalDivider, null)),
                React.createElement(Grid, { item: true, key: "import" }, bpMdUp ? (React.createElement(ComponentWithLabel, { control: React.createElement(SmallIconButton, { color: "primary" },
                        React.createElement(ImportIcon, null)), labelText: t("standalone.data-grid.header.import"), onClick: props.handleImport, labelPlacement: "bottom" })) : (React.createElement(Tooltip, { title: t("standalone.data-grid.header.import") ?? "" },
                    React.createElement(IconButton, { color: "primary", onClick: props.handleImport, size: "large" },
                        React.createElement(ImportIcon, null))))))))),
        addButtons.length > 0 && (React.createElement(React.Fragment, null,
            React.createElement(Grid, { item: true, xs: true, key: "divider-2" }),
            React.createElement(Grid, { item: true, container: true, key: "new", justifyContent: "flex-end", alignItems: "center", spacing: 2, wrap: "nowrap" }, addButtons.map((entry, index) => {
                const btn = (React.createElement(ActionButton, { small: !bpSmUp, icon: entry.icon ?? React.createElement(AddIcon, null), onClick: entry.onClick, disabled: !entry.onClick }, entry.label));
                return (React.createElement(Grid, { item: true, key: index.toString() }, !entry.onClick && entry.disableHint ? (React.createElement(Tooltip, { title: entry.disableHint },
                    React.createElement("span", null, btn))) : (btn)));
            })))),
        React.createElement(ResetMenu, { anchorEl: resetAnchorEl, onClose: closeResetMenu, refresh: props.refresh, resetFilter: props.resetFilter, resetSort: props.resetSort, resetColumn: props.resetColumn, resetWidth: props.resetWidth, resetAll: props.resetAll })));
};
export default React.memo(ActionBarView);
