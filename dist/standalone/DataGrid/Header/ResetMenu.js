import React, { useCallback } from "react";
import { MenuItem } from "@material-ui/core";
import useCCTranslations from "../../../utils/useCCTranslations";
import PopupMenu from "../../PopupMenu";
var anchorOrigin = {
    vertical: "bottom",
    horizontal: "center",
};
var transformOrigin = {
    vertical: "top",
    horizontal: "center",
};
var ResetMenu = function (props) {
    var t = useCCTranslations().t;
    var anchorEl = props.anchorEl, onClose = props.onClose, refresh = props.refresh, resetFilter = props.resetFilter, resetSort = props.resetSort, resetColumn = props.resetColumn, resetWidth = props.resetWidth, resetAll = props.resetAll;
    var refreshAndClose = useCallback(function () {
        refresh();
        onClose();
    }, [refresh, onClose]);
    var resetFilterAndClose = useCallback(function () {
        resetFilter();
        onClose();
    }, [resetFilter, onClose]);
    var resetSortAndClose = useCallback(function () {
        resetSort();
        onClose();
    }, [resetSort, onClose]);
    var resetColumnAndClose = useCallback(function () {
        resetColumn();
        onClose();
    }, [resetColumn, onClose]);
    var resetWidthAndClose = useCallback(function () {
        resetWidth();
        onClose();
    }, [resetWidth, onClose]);
    var resetAllAndClose = useCallback(function () {
        resetAll();
        onClose();
    }, [resetAll, onClose]);
    return (React.createElement(PopupMenu, { elevation: 0, anchorEl: anchorEl, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, keepMounted: true, getContentAnchorEl: null, open: !!anchorEl, onClose: onClose },
        React.createElement(MenuItem, { onClick: refreshAndClose }, t("standalone.data-grid.header.reset-options.refresh")),
        React.createElement(MenuItem, { onClick: resetFilterAndClose }, t("standalone.data-grid.header.reset-options.filter")),
        React.createElement(MenuItem, { onClick: resetSortAndClose }, t("standalone.data-grid.header.reset-options.sort")),
        React.createElement(MenuItem, { onClick: resetColumnAndClose }, t("standalone.data-grid.header.reset-options.column")),
        React.createElement(MenuItem, { onClick: resetWidthAndClose }, t("standalone.data-grid.header.reset-options.width")),
        React.createElement(MenuItem, { onClick: resetAllAndClose }, t("standalone.data-grid.header.reset-options.all"))));
};
export default React.memo(ResetMenu);
