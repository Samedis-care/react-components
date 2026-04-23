import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useState } from "react";
import { Grid, Tooltip, useMediaQuery, useTheme, } from "@mui/material";
import { SmallestIconButton } from "../../Small";
import VerticalDivider from "../../VerticalDivider";
import ComponentWithLabel from "../../UIKit/ComponentWithLabel";
import { Delete as DeleteIcon, Edit as EditIcon, Menu as MenuIcon, } from "@mui/icons-material";
import SelectAll from "./SelectAll";
import { DataGridSelectAllWrapper, useDataGridProps, } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
import DataActionBarMenu from "./DataActionBarMenu";
const DataActionBarView = (props) => {
    const { classes, editIcon, editLabel } = useDataGridProps();
    const { t } = useCCTranslations();
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only("xs"));
    const MyEditIcon = editIcon ?? EditIcon;
    const myEditLabel = editLabel ?? t("standalone.data-grid.footer.edit");
    const [extendedMenuAnchor, setExtendedMenuAnchor] = useState(undefined);
    const handleExtendedMenuOpen = useCallback((evt) => {
        setExtendedMenuAnchor(evt.currentTarget);
    }, []);
    const handleExtendedMenuClose = useCallback(() => {
        setExtendedMenuAnchor(undefined);
    }, []);
    const deleteBtn = (_jsx(ComponentWithLabel, { control: _jsx(SmallestIconButton, { color: "primary", disabled: props.numSelected === 0 || !props.handleDelete, onClick: props.handleDelete, "aria-label": t("standalone.data-grid.footer.delete"), children: _jsx(DeleteIcon, {}) }), labelText: t("standalone.data-grid.footer.delete"), labelPlacement: "bottom", disabled: props.numSelected === 0 || !props.handleDelete }));
    return (_jsxs(Grid, { container: true, wrap: "nowrap", children: [_jsx(Grid, { children: _jsx(DataGridSelectAllWrapper, { control: _jsx(SelectAll, {}), labelText: t("standalone.data-grid.footer.select-all"), labelPlacement: "bottom", className: classes?.selectAllWrapper, style: props.disableSelection
                        ? { opacity: 0, pointerEvents: "none" }
                        : undefined }) }, "select-all"), props.handleEdit && (_jsxs(_Fragment, { children: [_jsx(Grid, { children: _jsx(VerticalDivider, {}) }, "divider-1"), _jsx(Grid, { children: _jsx(ComponentWithLabel, { control: _jsx(SmallestIconButton, { color: "primary", disabled: props.numSelected !== 1, onClick: props.handleEdit, "aria-label": myEditLabel, children: _jsx(MyEditIcon, {}) }), labelText: myEditLabel, labelPlacement: "bottom", disabled: props.numSelected !== 1 }) }, "edit")] })), (props.handleDelete || props.disableDeleteHint) && (_jsxs(_Fragment, { children: [_jsx(Grid, { children: _jsx(VerticalDivider, {}) }, "divider-2"), _jsx(Grid, { children: !props.handleDelete && props.disableDeleteHint ? (_jsx(Tooltip, { title: props.disableDeleteHint, children: _jsx("span", { children: deleteBtn }) })) : (deleteBtn) }, "delete")] })), isXs && props.customButtons && props.customButtons.length > 1 ? (_jsxs(React.Fragment, { children: [_jsx(Grid, { children: _jsx(VerticalDivider, {}) }), _jsx(Grid, { children: _jsx(ComponentWithLabel, { control: _jsx(SmallestIconButton, { color: "primary", disabled: !props.customButtons.find((entry) => !entry.isDisabled(props.numSelected)), onClick: handleExtendedMenuOpen, "aria-label": t("standalone.data-grid.footer.more"), children: _jsx(MenuIcon, {}) }), labelText: t("standalone.data-grid.footer.more"), labelPlacement: "bottom", disabled: !props.customButtons.find((entry) => !entry.isDisabled(props.numSelected)) }) }), _jsx(DataActionBarMenu, { numSelected: props.numSelected, anchorEl: extendedMenuAnchor, onClose: handleExtendedMenuClose, customButtons: props.customButtons, handleCustomButtonClick: props.handleCustomButtonClick })] }, "custom-buttons-menu")) : (props.customButtons?.map((entry) => (_jsxs(React.Fragment, { children: [_jsx(Grid, { children: _jsx(VerticalDivider, {}) }), _jsx(Grid, { children: _jsx(ComponentWithLabel, { control: _jsx(SmallestIconButton, { color: "primary", disabled: entry.isDisabled(props.numSelected), onClick: () => {
                                    props.handleCustomButtonClick(entry.label);
                                }, "aria-label": entry.label, children: entry.icon }), labelText: entry.label, labelPlacement: "bottom", disabled: entry.isDisabled(props.numSelected) }) })] }, entry.label))))] }));
};
export default React.memo(DataActionBarView);
