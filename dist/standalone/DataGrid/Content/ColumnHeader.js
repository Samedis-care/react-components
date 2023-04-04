var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React, { useCallback, useEffect, useState } from "react";
import { combineClassNames, isTouchDevice } from "../../../utils";
import { useDataGridColumnState, useDataGridColumnsWidthState, useDataGridProps, useDataGridRootRef, useDataGridStyles, } from "../DataGrid";
import ColumnHeaderContent from "./ColumnHeaderContent";
export var HEADER_PADDING = 32; // px
export var applyColumnWidthLimits = function (column, targetWidth) {
    var width = column.width;
    var absMinWidth = HEADER_PADDING * (column.filterable ? 3 : 2);
    var wishMinWidth = (width && width[0]) || 0;
    var wishMaxWidth = (width && width[1]) || Number.MAX_SAFE_INTEGER;
    targetWidth = Math.max(targetWidth, absMinWidth, wishMinWidth);
    targetWidth = Math.min(targetWidth, wishMaxWidth);
    return targetWidth;
};
var FallbackColumnState = {
    sort: 0,
    sortOrder: undefined,
    filter: undefined,
};
var ColumnHeader = function (props) {
    var _a, _b;
    var column = props.column;
    var field = column.field, sortable = column.sortable, filterable = column.filterable;
    var gridRoot = useDataGridRootRef();
    var _c = useDataGridColumnState(), columnState = _c[0], setColumnState = _c[1];
    var sortLimit = useDataGridProps().sortLimit;
    var _d = (_a = columnState[field]) !== null && _a !== void 0 ? _a : FallbackColumnState, sort = _d.sort, sortOrder = _d.sortOrder, filter = _d.filter;
    var _e = useDataGridColumnsWidthState(), setColumnWidthState = _e[1];
    var _f = useState(false), dragging = _f[0], setDragging = _f[1];
    var classes = useDataGridStyles();
    var onFilterChange = useCallback(function (field, newFilter) {
        setColumnState(function (prevState) {
            var _a;
            return (__assign(__assign({}, prevState), (_a = {}, _a[field] = __assign(__assign({}, prevState[field]), { filter: newFilter }), _a)));
        });
    }, [setColumnState]);
    var onSortChange = useCallback(function (field, newSort, additional) {
        setColumnState(function (prevState) {
            var _a, _b;
            var newColumnState = __assign(__assign({}, prevState), (_a = {}, _a[field] = __assign(__assign({}, prevState[field]), { sort: newSort }), _a));
            if (additional) {
                if (newSort === 0) {
                    // if disable sorting, adjust sort priority for others
                    Object.keys(prevState)
                        .filter(function (otherField) {
                        return prevState[otherField].sort !== 0 &&
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            prevState[field].sortOrder < prevState[otherField].sortOrder;
                    })
                        .forEach(function (otherField) {
                        var _a;
                        newColumnState = __assign(__assign({}, newColumnState), (_a = {}, _a[otherField] = __assign(__assign({}, newColumnState[otherField]), { 
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            sortOrder: newColumnState[otherField].sortOrder - 1 }), _a));
                    });
                }
                else if (newSort === 1) {
                    // if enable sorting, set to highest order
                    var order = Object.keys(prevState).filter(function (otherField) { return prevState[otherField].sort !== 0; }).length + 1;
                    newColumnState = __assign(__assign({}, newColumnState), (_b = {}, _b[field] = __assign(__assign({}, newColumnState[field]), { sortOrder: order }), _b));
                    // if we reached the limit of max sorts we cancel this action
                    if (typeof sortLimit === "number" && order - 1 > sortLimit) {
                        return prevState;
                    }
                }
            }
            else {
                for (var key in newColumnState) {
                    if (key === field)
                        continue;
                    newColumnState[key].sort = 0;
                    newColumnState[key].sortOrder = undefined;
                }
                newColumnState[field].sortOrder = 1;
                // if sortLimit is null we cancel the operation
                if (typeof sortLimit === "number" && sortLimit === 0) {
                    return prevState;
                }
            }
            return newColumnState;
        });
    }, [sortLimit, setColumnState]);
    var startDrag = useCallback(function () { return setDragging(true); }, [setDragging]);
    var stopDrag = useCallback(function () { return setDragging(false); }, [setDragging]);
    var onDrag = useCallback(function (evt) {
        if (!dragging)
            return;
        evt.preventDefault();
        var move = evt.movementX;
        setColumnWidthState(function (prevState) {
            var _a;
            return (__assign(__assign({}, prevState), (_a = {}, _a[field] = applyColumnWidthLimits(column, prevState[field] + move), _a)));
        });
    }, [column, dragging, field, setColumnWidthState]);
    var onColumnSortChange = useCallback(function (modKey) {
        if (!sortable)
            return;
        if (sort !== 0 && modKey)
            onSortChange(field, 0, true);
        else if (sort === 0)
            onSortChange(field, 1, modKey);
        else if (sort === 1)
            onSortChange(field, -1, true);
        else if (sort === -1)
            onSortChange(field, 0, true);
    }, [sortable, field, sort, onSortChange]);
    var onColumnClick = useCallback(function (evt) {
        onColumnSortChange(evt.shiftKey);
    }, [onColumnSortChange]);
    var onColumnLongClick = useCallback(function (evt) {
        evt.preventDefault();
        onColumnSortChange(true);
    }, [onColumnSortChange]);
    var internalOnFilterChange = useCallback(function (newFilter) { return onFilterChange(field, newFilter); }, [field, onFilterChange]);
    var autoResize = useCallback(function () {
        if (!gridRoot)
            return;
        var width = 0;
        gridRoot.querySelectorAll(".column-" + field).forEach(function (entry) {
            var widthMeasurement = document.createElement("div");
            widthMeasurement.style.display = "inline";
            widthMeasurement.style.position = "absolute";
            widthMeasurement.style.left = "-99999px";
            widthMeasurement.style.height = getComputedStyle(entry).height;
            widthMeasurement.innerHTML = entry.innerHTML;
            document.body.appendChild(widthMeasurement);
            var entryWidth = widthMeasurement.clientWidth + HEADER_PADDING;
            document.body.removeChild(widthMeasurement);
            width = Math.max(width, entryWidth);
        });
        setColumnWidthState(function (prevState) {
            var _a;
            return (__assign(__assign({}, prevState), (_a = {}, _a[field] = applyColumnWidthLimits(column, width), _a)));
        });
    }, [column, field, gridRoot, setColumnWidthState]);
    useEffect(function () {
        document.addEventListener("mousemove", onDrag);
        document.addEventListener("mouseup", stopDrag);
        return function () {
            document.removeEventListener("mousemove", onDrag);
            document.removeEventListener("mouseup", stopDrag);
        };
    }, [onDrag, stopDrag]);
    return (React.createElement("div", { onClick: onColumnClick, onContextMenu: isTouchDevice() ? onColumnLongClick : undefined, className: combineClassNames([
            classes.columnHeaderContentWrapper,
            filterable && classes.columnHeaderFilterable,
            "column-header-" + column.field,
        ]) },
        React.createElement(ColumnHeaderContent, { headerName: (_b = props.column.headerLabel) !== null && _b !== void 0 ? _b : props.column.headerName, enableResize: true, startDrag: startDrag, autoResize: autoResize, sort: sort, sortOrder: sortOrder, filterable: !!filterable, filter: filter, onFilterChange: internalOnFilterChange, columnType: props.column.type, filterData: props.column.filterData })));
};
export default React.memo(ColumnHeader);
