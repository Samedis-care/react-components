import React, { useCallback, useState } from "react";
import { Box, Grid, IconButton, Popover, Tooltip, } from "@mui/material";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import FilterEntry from "./FilterEntry";
import { useDataGridStyles } from "../DataGrid";
import { FilterIcon, FilterActiveIcon } from "../../Icons";
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
    const classes = useDataGridStyles();
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const openFilter = useCallback((event) => {
        event.stopPropagation();
        setFilterAnchorEl(event.currentTarget);
    }, [setFilterAnchorEl]);
    const closeFilter = useCallback(() => setFilterAnchorEl(null), [setFilterAnchorEl]);
    const preventPropagation = useCallback((evt) => evt.stopPropagation(), []);
    const CurrentFilterIcon = props.filter && props.filter.value1 ? FilterActiveIcon : FilterIcon;
    return (React.createElement(React.Fragment, null,
        React.createElement(Grid, { container: true, justifyContent: "flex-start", wrap: "nowrap" },
            React.createElement(Grid, { item: true, className: combineClassNames([
                    classes.disableClick,
                    classes.columnHeaderLabel,
                ]), key: "header" },
                React.createElement(Tooltip, { title: props.headerName },
                    React.createElement("span", null, props.headerName.split("\n").map((text, index, arr) => (React.createElement(React.Fragment, { key: text },
                        text,
                        index == arr.length - 1 ? undefined : React.createElement("br", null))))))),
            React.createElement(Grid, { item: true, className: classes.columnHeaderSortIcon },
                props.sort === -1 && React.createElement(ArrowDownward, null),
                props.sort === 1 && React.createElement(ArrowUpward, null)),
            React.createElement(Grid, { item: true, xs: true }, props.sort !== 0 && props.sortOrder?.toString()),
            props.filterable && (React.createElement(Grid, { item: true, key: "filter" },
                React.createElement(Tooltip, { title: t("standalone.data-grid.content.filter") || "" },
                    React.createElement(IconButton, { className: combineClassNames([
                            classes.columnHeaderFilterButton,
                            props.filter?.value1 &&
                                classes.columnHeaderFilterButtonActive,
                        ]), onClick: openFilter, size: "large" },
                        React.createElement(CurrentFilterIcon, { className: classes.columnHeaderFilterIcon })))))),
        props.enableResize && (React.createElement("div", { className: classes.columnHeaderResizer, onMouseDown: props.startDrag, onClick: preventPropagation, onDoubleClick: props.autoResize })),
        React.createElement(Popover, { open: filterAnchorEl !== null, anchorEl: filterAnchorEl, onClose: closeFilter, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, onBackdropClick: preventPropagation, onClick: preventPropagation },
            React.createElement(Box, { m: 2 },
                React.createElement(Grid, { container: true, className: props.columnType === "enum"
                        ? classes.columnHeaderFilterPopupEnum
                        : classes.columnHeaderFilterPopup },
                    React.createElement(FilterEntry, { field: props.field, valueType: props.columnType, onChange: props.onFilterChange, value: props.filter, valueData: props.filterData, close: closeFilter, depth: 1 }))))));
};
export default React.memo(ColumnHeaderContent);
