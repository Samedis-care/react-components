import React, { useCallback, useState } from "react";
import { Grid, Tooltip, useMediaQuery, useTheme, } from "@mui/material";
import { SmallIconButton, VerticalDivider } from "../../index";
import ComponentWithLabel from "../../UIKit/ComponentWithLabel";
import { Edit as EditIcon, Delete as DeleteIcon, Menu as MenuIcon, } from "@mui/icons-material";
import SelectAll from "./SelectAll";
import { useDataGridStyles } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
import DataActionBarMenu from "./DataActionBarMenu";
var DataActionBarView = function (props) {
    var _a;
    var classes = useDataGridStyles();
    var t = useCCTranslations().t;
    var theme = useTheme();
    var isXs = useMediaQuery(theme.breakpoints.only("xs"));
    var _b = useState(undefined), extendedMenuAnchor = _b[0], setExtendedMenuAnchor = _b[1];
    var handleExtendedMenuOpen = useCallback(function (evt) {
        setExtendedMenuAnchor(evt.currentTarget);
    }, []);
    var handleExtendedMenuClose = useCallback(function () {
        setExtendedMenuAnchor(undefined);
    }, []);
    var deleteBtn = (React.createElement(ComponentWithLabel, { control: React.createElement(SmallIconButton, { color: "primary", disabled: props.numSelected === 0 || !props.handleDelete, onClick: props.handleDelete },
            React.createElement(DeleteIcon, null)), labelText: t("standalone.data-grid.footer.delete"), labelPlacement: "bottom", disabled: props.numSelected === 0 || !props.handleDelete }));
    return (React.createElement(Grid, { container: true, wrap: "nowrap" },
        React.createElement(Grid, { item: true, key: "select-all" },
            React.createElement(ComponentWithLabel, { control: React.createElement(SelectAll, null), labelText: t("standalone.data-grid.footer.select-all"), labelPlacement: "bottom", className: classes.selectAllWrapper, style: props.disableSelection
                    ? { opacity: 0, pointerEvents: "none" }
                    : undefined })),
        props.handleEdit && (React.createElement(React.Fragment, null,
            React.createElement(Grid, { item: true, key: "divider-1" },
                React.createElement(VerticalDivider, null)),
            React.createElement(Grid, { item: true, key: "edit" },
                React.createElement(ComponentWithLabel, { control: React.createElement(SmallIconButton, { color: "primary", disabled: props.numSelected !== 1, onClick: props.handleEdit },
                        React.createElement(EditIcon, null)), labelText: t("standalone.data-grid.footer.edit"), labelPlacement: "bottom", disabled: props.numSelected !== 1 })))),
        (props.handleDelete || props.disableDeleteHint) && (React.createElement(React.Fragment, null,
            React.createElement(Grid, { item: true, key: "divider-2" },
                React.createElement(VerticalDivider, null)),
            React.createElement(Grid, { item: true, key: "delete" }, !props.handleDelete && props.disableDeleteHint ? (React.createElement(Tooltip, { title: props.disableDeleteHint },
                React.createElement("span", null, deleteBtn))) : (deleteBtn)))),
        isXs && props.customButtons && props.customButtons.length > 1 ? (React.createElement(React.Fragment, { key: "custom-buttons-menu" },
            React.createElement(Grid, { item: true },
                React.createElement(VerticalDivider, null)),
            React.createElement(Grid, { item: true },
                React.createElement(ComponentWithLabel, { control: React.createElement(SmallIconButton, { color: "primary", disabled: !props.customButtons.find(function (entry) { return !entry.isDisabled(props.numSelected); }), onClick: handleExtendedMenuOpen },
                        React.createElement(MenuIcon, null)), labelText: t("standalone.data-grid.footer.more"), labelPlacement: "bottom", disabled: !props.customButtons.find(function (entry) { return !entry.isDisabled(props.numSelected); }) })),
            React.createElement(DataActionBarMenu, { numSelected: props.numSelected, anchorEl: extendedMenuAnchor, onClose: handleExtendedMenuClose, customButtons: props.customButtons, handleCustomButtonClick: props.handleCustomButtonClick }))) : ((_a = props.customButtons) === null || _a === void 0 ? void 0 : _a.map(function (entry) { return (React.createElement(React.Fragment, { key: entry.label },
            React.createElement(Grid, { item: true },
                React.createElement(VerticalDivider, null)),
            React.createElement(Grid, { item: true },
                React.createElement(ComponentWithLabel, { control: React.createElement(SmallIconButton, { color: "primary", disabled: entry.isDisabled(props.numSelected), onClick: function () {
                            props.handleCustomButtonClick(entry.label);
                        } }, entry.icon), labelText: entry.label, labelPlacement: "bottom", disabled: entry.isDisabled(props.numSelected) })))); }))));
};
export default React.memo(DataActionBarView);
