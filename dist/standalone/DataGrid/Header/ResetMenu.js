import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { MenuItem } from "@mui/material";
import useCCTranslations from "../../../utils/useCCTranslations";
import PopupMenu from "../../PopupMenu";
const anchorOrigin = {
    vertical: "bottom",
    horizontal: "center",
};
const transformOrigin = {
    vertical: "top",
    horizontal: "center",
};
const ResetMenu = (props) => {
    const { t } = useCCTranslations();
    const { anchorEl, onClose, refresh, resetFilter, resetSort, resetColumn, resetWidth, resetAll, } = props;
    const refreshAndClose = useCallback(() => {
        refresh();
        onClose();
    }, [refresh, onClose]);
    const resetFilterAndClose = useCallback(() => {
        resetFilter();
        onClose();
    }, [resetFilter, onClose]);
    const resetSortAndClose = useCallback(() => {
        resetSort();
        onClose();
    }, [resetSort, onClose]);
    const resetColumnAndClose = useCallback(() => {
        resetColumn();
        onClose();
    }, [resetColumn, onClose]);
    const resetWidthAndClose = useCallback(() => {
        resetWidth();
        onClose();
    }, [resetWidth, onClose]);
    const resetAllAndClose = useCallback(() => {
        resetAll();
        onClose();
    }, [resetAll, onClose]);
    return (_jsxs(PopupMenu, { elevation: 0, anchorEl: anchorEl, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, keepMounted: true, open: !!anchorEl, onClose: onClose, children: [_jsx(MenuItem, { onClick: refreshAndClose, children: t("standalone.data-grid.header.reset-options.refresh") }), _jsx(MenuItem, { onClick: resetFilterAndClose, children: t("standalone.data-grid.header.reset-options.filter") }), _jsx(MenuItem, { onClick: resetSortAndClose, children: t("standalone.data-grid.header.reset-options.sort") }), _jsx(MenuItem, { onClick: resetColumnAndClose, children: t("standalone.data-grid.header.reset-options.column") }), _jsx(MenuItem, { onClick: resetWidthAndClose, children: t("standalone.data-grid.header.reset-options.width") }), _jsx(MenuItem, { onClick: resetAllAndClose, children: t("standalone.data-grid.header.reset-options.all") })] }));
};
export default React.memo(ResetMenu);
