import React, { useCallback, useState } from "react";
import { Box, Grid, IconButton, Popover, Tooltip, } from "@material-ui/core";
import { ArrowDownward, ArrowUpward } from "@material-ui/icons";
import FilterEntry from "./FilterEntry";
import { useDataGridStyles } from "../DataGrid";
import { FilterIcon, FilterActiveIcon } from "../../Icons";
import useCCTranslations from "../../../utils/useCCTranslations";
import { combineClassNames } from "../../../utils";
var anchorOrigin = {
    vertical: "bottom",
    horizontal: "center",
};
var transformOrigin = {
    vertical: "top",
    horizontal: "center",
};
var ColumnHeaderContent = function (props) {
    var _a, _b;
    var t = useCCTranslations().t;
    var classes = useDataGridStyles();
    var _c = useState(null), filterAnchorEl = _c[0], setFilterAnchorEl = _c[1];
    var openFilter = useCallback(function (event) {
        event.stopPropagation();
        setFilterAnchorEl(event.currentTarget);
    }, [setFilterAnchorEl]);
    var closeFilter = useCallback(function () { return setFilterAnchorEl(null); }, [
        setFilterAnchorEl,
    ]);
    var preventPropagation = useCallback(function (evt) { return evt.stopPropagation(); }, []);
    var CurrentFilterIcon = props.filter && props.filter.value1 ? FilterActiveIcon : FilterIcon;
    return (React.createElement(React.Fragment, null,
        React.createElement(Grid, { container: true, justify: "flex-start", wrap: "nowrap" },
            React.createElement(Grid, { item: true, className: combineClassNames([
                    classes.disableClick,
                    classes.columnHeaderLabel,
                ]), key: "header" },
                React.createElement(Tooltip, { title: props.headerName },
                    React.createElement("span", null, props.headerName.split("\n").map(function (text, index, arr) { return (React.createElement(React.Fragment, { key: text },
                        text,
                        index == arr.length - 1 ? undefined : React.createElement("br", null))); })))),
            React.createElement(Grid, { item: true, className: classes.columnHeaderSortIcon },
                props.sort === -1 && React.createElement(ArrowDownward, null),
                props.sort === 1 && React.createElement(ArrowUpward, null)),
            React.createElement(Grid, { item: true, xs: true }, props.sort !== 0 && ((_a = props.sortOrder) === null || _a === void 0 ? void 0 : _a.toString())),
            props.filterable && (React.createElement(Grid, { item: true, key: "filter" },
                React.createElement(Tooltip, { title: t("standalone.data-grid.content.filter") || "" },
                    React.createElement(IconButton, { className: combineClassNames([
                            classes.columnHeaderFilterButton,
                            ((_b = props.filter) === null || _b === void 0 ? void 0 : _b.value1) &&
                                classes.columnHeaderFilterButtonActive,
                        ]), onClick: openFilter },
                        React.createElement(CurrentFilterIcon, { className: classes.columnHeaderFilterIcon })))))),
        props.enableResize && (React.createElement("div", { className: classes.columnHeaderResizer, onMouseDown: props.startDrag, onClick: preventPropagation, onDoubleClick: props.autoResize })),
        React.createElement(Popover, { open: filterAnchorEl !== null, anchorEl: filterAnchorEl, onClose: closeFilter, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, onBackdropClick: preventPropagation, onClick: preventPropagation },
            React.createElement(Box, { m: 2 },
                React.createElement(Grid, { container: true, className: classes.columnHeaderFilterPopup },
                    React.createElement(FilterEntry, { valueType: props.columnType, onChange: props.onFilterChange, value: props.filter, valueData: props.filterData, close: closeFilter, depth: 1 }))))));
};
export default React.memo(ColumnHeaderContent);
