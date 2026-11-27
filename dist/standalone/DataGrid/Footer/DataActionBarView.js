import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useId, useState } from "react";
import { CircularProgress, styled, Tooltip, useMediaQuery, useTheme, } from "@mui/material";
import { SmallestIconButton } from "../../Small";
import VerticalDivider from "../../VerticalDivider";
import ComponentWithLabel from "../../UIKit/ComponentWithLabel";
import { Delete as DeleteIcon, Edit as EditIcon, Menu as MenuIcon, } from "@mui/icons-material";
import SelectAll from "./SelectAll";
import { DataGridSelectAllWrapper, useDataGridProps, } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
import DataActionBarMenu from "./DataActionBarMenu";
import FocusableWhenDisabledIconButton from "./FocusableWhenDisabledIconButton";
import { dataGridIsCustomDataActionDisabled } from "../CallbackUtil";
import useMenuButton from "../../../utils/internal/useMenuButton";
import dataActionMargins from "./dataActionMargins";
/**
 * The bar: its actions side by side, centred in its height, which is the
 * footer's. The dividers between them (VerticalDivider flexItem) run from its
 * top to its bottom.
 */
const DataActionBarRoot = styled("div")({
    display: "flex",
    alignItems: "center",
});
/**
 * Edit, Delete, More or a custom action. The select all checkbox
 * (DataGridSelectAllWrapper) has the same margins.
 */
const DataActionBarAction = styled(ComponentWithLabel)(({ theme }) => dataActionMargins(theme));
/**
 * The element that shows the tooltip of an unavailable Delete: lays Delete
 * out in the bar like the other actions
 */
const DeleteHintAnchor = styled("span")({
    display: "flex",
});
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
    const extendedMenu = useMenuButton(!!extendedMenuAnchor);
    const deleteId = useId();
    const deleteDisabled = props.deleting ||
        props.numSelected === 0 ||
        !props.handleDelete ||
        (props.selectAll && !props.enableDeleteAll);
    // stays focusable while disabled: a delete clears the selection, which
    // disables Delete while it has keyboard focus
    const deleteBtn = (_jsx(DataActionBarAction, { control: _jsx(FocusableWhenDisabledIconButton, { id: deleteId, color: "primary", disabled: deleteDisabled, onClick: props.handleDelete, "aria-label": t("standalone.data-grid.footer.delete"), children: props.deleting ? (_jsx(CircularProgress, { size: 20, color: "inherit", "aria-labelledby": deleteId })) : (_jsx(DeleteIcon, {})) }), labelText: t("standalone.data-grid.footer.delete"), labelPlacement: "bottom", disabled: deleteDisabled }));
    // On phones (only xs) the bar has to fit 320px: the hidden select all
    // takes no place there, and the custom actions are entries of "More" when
    // there are two or more, or when select all, Edit and Delete are in the bar
    // too (four actions and the count don't fit)
    const selectAllTakesPlace = !isXs || !props.disableSelection;
    const hasEdit = !!props.handleEdit;
    const hasDelete = !!(props.handleDelete || props.disableDeleteHint);
    const numCustomButtons = props.customButtons?.length ?? 0;
    const customButtonsInMenu = isXs &&
        (numCustomButtons > 1 ||
            (numCustomButtons === 1 && selectAllTakesPlace && hasEdit && hasDelete));
    // the dividers go between the actions: none before the first
    const dividerBeforeEdit = selectAllTakesPlace;
    const dividerBeforeDelete = dividerBeforeEdit || hasEdit;
    const dividerBeforeCustom = dividerBeforeDelete || hasDelete;
    const allCustomButtonsDisabled = !!props.customButtons?.every((entry) => dataGridIsCustomDataActionDisabled(entry, props.numSelected, props.selectAll));
    return (_jsxs(DataActionBarRoot, { "aria-busy": props.deleting || undefined, children: [selectAllTakesPlace && (_jsx(DataGridSelectAllWrapper, { control: _jsx(SelectAll, {}), labelText: props.selectAllLabel, labelPlacement: "bottom", 
                // the checkbox reads its disabled state from the select all
                // context, so the label can't take it from its control
                disabled: props.selectAllDisabled, className: classes?.selectAllWrapper, style: props.disableSelection
                    ? { opacity: 0, pointerEvents: "none" }
                    : undefined })), hasEdit && (_jsxs(_Fragment, { children: [dividerBeforeEdit && _jsx(VerticalDivider, { flexItem: true }), _jsx(DataActionBarAction, { control: _jsx(SmallestIconButton, { color: "primary", disabled: props.editDisabled, onClick: props.handleEdit, "aria-label": myEditLabel, children: _jsx(MyEditIcon, {}) }), labelText: myEditLabel, labelPlacement: "bottom", disabled: props.editDisabled })] })), hasDelete && (_jsxs(_Fragment, { children: [dividerBeforeDelete && _jsx(VerticalDivider, { flexItem: true }), !props.handleDelete && props.disableDeleteHint ? (_jsx(Tooltip, { title: props.disableDeleteHint, children: _jsx(DeleteHintAnchor, { children: deleteBtn }) })) : (deleteBtn)] })), customButtonsInMenu && props.customButtons ? (_jsxs(React.Fragment, { children: [dividerBeforeCustom && _jsx(VerticalDivider, { flexItem: true }), _jsx(DataActionBarAction, { control: _jsx(SmallestIconButton, { ...extendedMenu.buttonProps, color: "primary", disabled: allCustomButtonsDisabled, onClick: handleExtendedMenuOpen, "aria-label": t("standalone.data-grid.footer.more"), children: _jsx(MenuIcon, {}) }), labelText: t("standalone.data-grid.footer.more"), labelPlacement: "bottom", disabled: allCustomButtonsDisabled }), _jsx(DataActionBarMenu, { numSelected: props.numSelected, selectAll: props.selectAll, anchorEl: extendedMenuAnchor, onClose: handleExtendedMenuClose, customButtons: props.customButtons, handleCustomButtonClick: props.handleCustomButtonClick, slotProps: extendedMenu.slotProps })] }, "custom-buttons-menu")) : (props.customButtons?.map((entry, index) => {
                const disabled = dataGridIsCustomDataActionDisabled(entry, props.numSelected, props.selectAll);
                return (_jsxs(React.Fragment, { children: [(index > 0 || dividerBeforeCustom) && (_jsx(VerticalDivider, { flexItem: true })), _jsx(DataActionBarAction, { control: _jsx(SmallestIconButton, { color: "primary", disabled: disabled, onClick: () => {
                                    props.handleCustomButtonClick(entry.label);
                                }, "aria-label": entry.label, children: entry.icon }), labelText: entry.label, labelPlacement: "bottom", disabled: disabled })] }, entry.label));
            }))] }));
};
export default React.memo(DataActionBarView);
