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
    return (React.createElement(PopupMenu, { elevation: 0, anchorEl: anchorEl, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, keepMounted: true, open: !!anchorEl, onClose: onClose },
        React.createElement(MenuItem, { onClick: refreshAndClose }, t("standalone.data-grid.header.reset-options.refresh")),
        React.createElement(MenuItem, { onClick: resetFilterAndClose }, t("standalone.data-grid.header.reset-options.filter")),
        React.createElement(MenuItem, { onClick: resetSortAndClose }, t("standalone.data-grid.header.reset-options.sort")),
        React.createElement(MenuItem, { onClick: resetColumnAndClose }, t("standalone.data-grid.header.reset-options.column")),
        React.createElement(MenuItem, { onClick: resetWidthAndClose }, t("standalone.data-grid.header.reset-options.width")),
        React.createElement(MenuItem, { onClick: resetAllAndClose }, t("standalone.data-grid.header.reset-options.all"))));
};
export default React.memo(ResetMenu);
