import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useCallback, useState } from "react";
import { Box, Grid, Popover, Tooltip } from "@mui/material";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import FilterEntry from "./FilterEntry";
import { DataGridColumnHeaderFilterActiveIcon, DataGridColumnHeaderFilterButton, DataGridColumnHeaderFilterIcon, DataGridColumnHeaderFilterPopup, DataGridColumnHeaderFilterPopupDateTime, DataGridColumnHeaderFilterPopupEnum, DataGridColumnHeaderFilterPopupId, DataGridColumnHeaderLabel, DataGridColumnHeaderLabelText, DataGridColumnHeaderResizer, DataGridColumnHeaderSortButton, DataGridColumnHeaderSortIcon, useDataGridProps, } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
import combineClassNames from "../../../utils/combineClassNames";
const anchorOrigin = {
    vertical: "bottom",
    horizontal: "center",
};
const transformOrigin = {
    vertical: "top",
    horizontal: "center",
};
const ColumnHeaderContent = (props) => {
    const { t } = useCCTranslations();
    const { classes } = useDataGridProps();
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const openFilter = useCallback((event) => {
        event.stopPropagation();
        setFilterAnchorEl(event.currentTarget);
    }, [setFilterAnchorEl]);
    const closeFilter = useCallback((evt, reason) => {
        if (reason === "backdropClick") {
            evt.stopPropagation();
        }
        setFilterAnchorEl(null);
    }, [setFilterAnchorEl]);
    const preventPropagation = useCallback((evt) => evt.stopPropagation(), []);
    // Enter (when pressed) and Space (when released) sort here, not through the
    // click the button fires for them: that click does not carry Shift in every
    // browser. preventDefault keeps the button from firing it, so the header's
    // click handler does not sort a second time. Clicks with the pointer or
    // from assistive technology reach the header's click handler as before.
    const { onSort } = props;
    const onSortButtonKeyDown = useCallback((evt) => {
        if (evt.key !== "Enter" || evt.target !== evt.currentTarget)
            return;
        evt.preventDefault();
        // a held Enter sorts once
        if (!evt.repeat)
            onSort(evt.shiftKey);
    }, [onSort]);
    const onSortButtonKeyUp = useCallback((evt) => {
        if (evt.key !== " " || evt.target !== evt.currentTarget)
            return;
        evt.preventDefault();
        onSort(evt.shiftKey);
    }, [onSort]);
    const label = typeof props.headerName === "string"
        ? props.headerName.split("\n").map((text, index, arr) => (_jsxs(React.Fragment, { children: [text, index == arr.length - 1 ? undefined : _jsx("br", {})] }, index)))
        : props.headerName;
    const CurrentFilterIcon = props.filter && props.filter.value1
        ? DataGridColumnHeaderFilterActiveIcon
        : DataGridColumnHeaderFilterIcon;
    const ColumnHeaderFilterPopupComp = props.columnType === "datetime"
        ? DataGridColumnHeaderFilterPopupDateTime
        : props.columnType === "enum"
            ? DataGridColumnHeaderFilterPopupEnum
            : props.columnType === "id"
                ? DataGridColumnHeaderFilterPopupId
                : DataGridColumnHeaderFilterPopup;
    return (_jsxs(_Fragment, { children: [_jsxs(Grid, { container: true, sx: { justifyContent: "flex-start" }, wrap: "nowrap", children: [_jsx(DataGridColumnHeaderLabel, { className: classes?.columnHeaderLabel, children: _jsx(Tooltip, { title: props.headerName, children: props.sortable ? (_jsx(DataGridColumnHeaderSortButton, { className: classes?.columnHeaderSortButton, onKeyDown: onSortButtonKeyDown, onKeyUp: onSortButtonKeyUp, disableRipple: true, children: label })) : (_jsx(DataGridColumnHeaderLabelText, { className: classes?.columnHeaderLabelText, 
                                // the keyboard's way to the tooltip, with the full text of
                                // a label cut off. An element keeps what it is: a focusable
                                // element in it shows the tooltip
                                tabIndex: typeof props.headerName === "string" ? 0 : undefined, children: label })) }) }, "header"), _jsxs(DataGridColumnHeaderSortIcon, { className: classes?.columnHeaderSortIcon, children: [props.sort === -1 && _jsx(ArrowDownward, {}), props.sort === 1 && _jsx(ArrowUpward, {})] }), _jsx(Grid, { size: "grow", children: props.sort !== 0 && props.sortOrder?.toString() }), props.filterable && (_jsx(Grid, { children: _jsx(Tooltip, { title: t("standalone.data-grid.content.filter") || "", children: _jsx(DataGridColumnHeaderFilterButton, { className: combineClassNames([
                                    classes?.columnHeaderFilterButton,
                                    props.filter?.value1 &&
                                        "CcDataGrid-columnHeaderFilterButtonActive",
                                ]), onClick: openFilter, size: "large", children: _jsx(CurrentFilterIcon, { className: props.filter?.value1
                                        ? classes?.columnHeaderFilterActiveIcon
                                        : classes?.columnHeaderFilterIcon }) }) }) }, "filter"))] }), props.enableResize && (_jsx(DataGridColumnHeaderResizer, { className: classes?.columnHeaderResizer, onMouseDown: props.startDrag, onClick: preventPropagation, onDoubleClick: props.autoResize })), _jsx(Popover, { open: filterAnchorEl !== null, anchorEl: filterAnchorEl, onClose: closeFilter, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, onClick: preventPropagation, children: _jsx(Box, { sx: { m: 2 }, children: _jsx(ColumnHeaderFilterPopupComp, { container: true, className: props.columnType === "datetime"
                            ? classes?.columnHeaderFilterPopupDateTime
                            : props.columnType === "enum"
                                ? classes?.columnHeaderFilterPopupEnum
                                : classes?.columnHeaderFilterPopup, children: _jsx(FilterEntry, { field: props.field, valueType: props.columnType, onChange: props.onFilterChange, value: props.filter, valueData: props.filterData, close: closeFilter, depth: 1 }) }) }) })] }));
};
export default React.memo(ColumnHeaderContent);
