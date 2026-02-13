import React, { useCallback, useState } from "react";
import { Box, Grid, Popover, Tooltip } from "@mui/material";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import FilterEntry from "./FilterEntry";
import { DataGridColumnHeaderFilterActiveIcon, DataGridColumnHeaderFilterButton, DataGridColumnHeaderFilterIcon, DataGridColumnHeaderFilterPopup, DataGridColumnHeaderFilterPopupDateTime, DataGridColumnHeaderFilterPopupEnum, DataGridColumnHeaderFilterPopupId, DataGridColumnHeaderLabel, DataGridColumnHeaderResizer, DataGridColumnHeaderSortIcon, useDataGridProps, } from "../DataGrid";
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
    return (React.createElement(React.Fragment, null,
        React.createElement(Grid, { container: true, justifyContent: "flex-start", wrap: "nowrap" },
            React.createElement(DataGridColumnHeaderLabel, { className: classes?.columnHeaderLabel, key: "header" },
                React.createElement(Tooltip, { title: props.headerName },
                    React.createElement("span", null, typeof props.headerName === "string"
                        ? props.headerName.split("\n").map((text, index, arr) => (React.createElement(React.Fragment, { key: text },
                            text,
                            index == arr.length - 1 ? undefined : React.createElement("br", null))))
                        : props.headerName))),
            React.createElement(DataGridColumnHeaderSortIcon, { className: classes?.columnHeaderSortIcon },
                props.sort === -1 && React.createElement(ArrowDownward, null),
                props.sort === 1 && React.createElement(ArrowUpward, null)),
            React.createElement(Grid, { size: "grow" }, props.sort !== 0 && props.sortOrder?.toString()),
            props.filterable && (React.createElement(Grid, { key: "filter" },
                React.createElement(Tooltip, { title: t("standalone.data-grid.content.filter") || "" },
                    React.createElement(DataGridColumnHeaderFilterButton, { className: combineClassNames([
                            classes?.columnHeaderFilterButton,
                            props.filter?.value1 &&
                                "CcDataGrid-columnHeaderFilterButtonActive",
                        ]), onClick: openFilter, size: "large" },
                        React.createElement(CurrentFilterIcon, { className: props.filter?.value1
                                ? classes?.columnHeaderFilterActiveIcon
                                : classes?.columnHeaderFilterIcon })))))),
        props.enableResize && (React.createElement(DataGridColumnHeaderResizer, { className: classes?.columnHeaderResizer, onMouseDown: props.startDrag, onClick: preventPropagation, onDoubleClick: props.autoResize })),
        React.createElement(Popover, { open: filterAnchorEl !== null, anchorEl: filterAnchorEl, onClose: closeFilter, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, onClick: preventPropagation },
            React.createElement(Box, { m: 2 },
                React.createElement(ColumnHeaderFilterPopupComp, { container: true, className: props.columnType === "datetime"
                        ? classes?.columnHeaderFilterPopupDateTime
                        : props.columnType === "enum"
                            ? classes?.columnHeaderFilterPopupEnum
                            : classes?.columnHeaderFilterPopup },
                    React.createElement(FilterEntry, { field: props.field, valueType: props.columnType, onChange: props.onFilterChange, value: props.filter, valueData: props.filterData, close: closeFilter, depth: 1 }))))));
};
export default React.memo(ColumnHeaderContent);
