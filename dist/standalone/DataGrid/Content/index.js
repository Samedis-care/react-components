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
import React, { useCallback, useEffect, useMemo, useState, } from "react";
import { useDataGridColumnsWidthState, useDataGridState, } from "../DataGrid";
import AutoSizer from "react-virtualized-auto-sizer";
import Cell, { CellContext } from "./Cell";
import { applyColumnWidthLimits } from "./ColumnHeader";
import { Loader } from "../../index";
import useCCTranslations from "../../../utils/useCCTranslations";
import { withStyles } from "@material-ui/core";
import CenteredTypography from "../../UIKit/CenteredTypography";
import MultiGrid from "../../Virtualized/MultiGrid";
var CenteredStickyTypography = withStyles({
    outerWrapper: {
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
})(CenteredTypography);
var SELECT_ROW_WIDTH = 57;
var DEFAULT_COLUMN_WIDTH = 200;
var STYLE_TOP_LEFT = { overflow: "hidden" };
var STYLE_BOTTOM_RIGHT = { outline: "none" };
var Content = function (props) {
    var rowsPerPage = props.rowsPerPage, columns = props.columns, disableSelection = props.disableSelection, headerHeightOverride = props.headerHeight, globalScrollListener = props.globalScrollListener;
    var headerHeight = headerHeightOverride !== null && headerHeightOverride !== void 0 ? headerHeightOverride : 32;
    var t = useCCTranslations().t;
    var _a = useDataGridState(), state = _a[0], setState = _a[1];
    var _b = useDataGridColumnsWidthState(), columnWidth = _b[0], setColumnWidth = _b[1];
    var _c = useState(0), width = _c[0], setWidth = _c[1];
    var hoverState = useState(null);
    var pages = state.pages;
    var onSectionRendered = useCallback(function (props) {
        var pageStart = (props.visibleRowStartIndex / rowsPerPage) | 0;
        var pageEnd = (props.visibleRowStopIndex / rowsPerPage) | 0;
        if (pageStart !== pages[0] || pageEnd !== pages[1]) {
            setState(function (prevState) { return (__assign(__assign({}, prevState), { pages: [pageStart, pageEnd] })); });
        }
    }, [rowsPerPage, setState, pages]);
    var onResize = useCallback(function (size) {
        setWidth(size.width);
    }, []);
    var scrollbarWidth = useMemo(function () {
        var scrollDiv = document.createElement("div");
        scrollDiv.style.width = "100px";
        scrollDiv.style.height = "100px";
        scrollDiv.style.overflow = "scroll";
        scrollDiv.style.position = "absolute";
        scrollDiv.style.top = "-101px";
        document.body.appendChild(scrollDiv);
        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        document.body.removeChild(scrollDiv);
        return scrollbarWidth;
    }, []);
    var remainingWidth = useMemo(function () {
        var columnsToResize = Object.keys(columnWidth)
            .map(function (field) { return columns.find(function (col) { return col.field === field; }); })
            .filter(function (entry) { return entry; })
            .filter(function (entry) { return !state.hiddenColumns.includes(entry.field); })
            .filter(function (entry) { return !entry.width || !entry.width[2]; });
        var usedWidth = Object.entries(columnWidth)
            .filter(function (_a) {
            var field = _a[0];
            return columnsToResize.find(function (col) { return col.field === field; });
        })
            .reduce(function (a, b) { return a + b[1]; }, 0) +
            (disableSelection ? 0 : SELECT_ROW_WIDTH);
        return Math.max(width - usedWidth - scrollbarWidth, 0);
    }, [
        columnWidth,
        columns,
        disableSelection,
        state.hiddenColumns,
        width,
        scrollbarWidth,
    ]);
    useEffect(function () {
        if (width <= 0)
            return;
        if (state.initialResize)
            return;
        // only run on initial resize
        setColumnWidth(function (prevState) {
            // resolve all visible columns which don't have an fixed initial width
            var columnsToResize = Object.keys(prevState)
                .map(function (field) { return columns.find(function (col) { return col.field === field; }); })
                .filter(function (entry) { return entry; })
                .filter(function (entry) { return !state.hiddenColumns.includes(entry.field); })
                .filter(function (entry) { return !entry.width || !entry.width[2]; });
            // determine width used by visible columns
            var usedWidth = Object.entries(prevState)
                .filter(function (_a) {
                var field = _a[0];
                return columnsToResize.find(function (col) { return col.field === field; });
            })
                .reduce(function (a, b) { return a + b[1]; }, 0) +
                (disableSelection ? 0 : SELECT_ROW_WIDTH);
            var remainingWidth = width - usedWidth - scrollbarWidth;
            if (remainingWidth <= 0)
                return prevState;
            // divide width over the visible columns while honoring limits
            var newState = __assign({}, prevState);
            var _loop_1 = function () {
                var resizePerColumn = remainingWidth / columns.length;
                var newRemainingWidth = 0;
                columnsToResize.forEach(function (col) {
                    if (!(col.field in newState))
                        return;
                    var newSize = applyColumnWidthLimits(col, newState[col.field] + resizePerColumn);
                    var widthDiff = newState[col.field] + resizePerColumn - newSize;
                    if (widthDiff !== 0) {
                        // remove the current column from the resizable list if we hit max-width
                        columnsToResize = columnsToResize.filter(function (altcol) { return altcol.field !== col.field; });
                    }
                    newRemainingWidth += widthDiff;
                    newState[col.field] = newSize;
                });
                remainingWidth = newRemainingWidth;
            };
            while (remainingWidth > 0) {
                _loop_1();
            }
            return newState;
        });
        setState(function (prev) { return (__assign(__assign({}, prev), { initialResize: true })); });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.initialResize, width]);
    var noContentRenderer = useCallback(function () { return (React.createElement(React.Fragment, null, state.refreshData ? (React.createElement(Loader, null)) : state.dataLoadError ? (React.createElement(CenteredStickyTypography, { variant: "h5" }, state.dataLoadError.message)) : (React.createElement(CenteredStickyTypography, { variant: "h4" }, t("standalone.data-grid.content.no-data"))))); }, [state.dataLoadError, state.refreshData, t]);
    var styleTopRightGrid = useMemo(function () {
        var _a;
        return ({
            overflow: "hidden",
            overflowX: ((_a = state.rowsFiltered) !== null && _a !== void 0 ? _a : state.rowsTotal) === 0 ? "auto" : "hidden",
            overscrollBehavior: "contain",
            display: columns.length === 0 ? "none" : undefined,
        });
    }, [columns.length, state.rowsFiltered, state.rowsTotal]);
    var styleBottomLeftGrid = useMemo(function () {
        var _a;
        return ({
            display: ((_a = state.rowsFiltered) !== null && _a !== void 0 ? _a : state.rowsTotal) === 0 ? "none" : undefined,
        });
    }, [state.rowsFiltered, state.rowsTotal]);
    var getRowHeight = useCallback(function (index) { return (index === 0 ? headerHeight : 57); }, [headerHeight]);
    var getColumnWidth = useCallback(function (index) {
        var _a;
        return !disableSelection && index === 0
            ? SELECT_ROW_WIDTH
            : index !== columns.length + (disableSelection ? 0 : 1)
                ? (_a = columnWidth[columns[index - (disableSelection ? 0 : 1)].field]) !== null && _a !== void 0 ? _a : DEFAULT_COLUMN_WIDTH
                : remainingWidth;
    }, [columnWidth, columns, disableSelection, remainingWidth]);
    return (React.createElement(AutoSizer, { onResize: onResize }, function (_a) {
        var _b;
        var width = _a.width, height = _a.height;
        return (React.createElement(CellContext.Provider, { value: { columns: columns, hoverState: hoverState } },
            React.createElement(MultiGrid, { columnCount: columns.length +
                    (disableSelection ? 0 : 1) +
                    (columns.length > 0 ? 1 : 0), columnWidth: getColumnWidth, rowCount: ((_b = state.rowsFiltered) !== null && _b !== void 0 ? _b : state.rowsTotal) + 1, rowHeight: getRowHeight, width: width, height: height, onItemsRendered: onSectionRendered, fixedColumnCount: columns.filter(function (col) { return col.isLocked; }).length +
                    (disableSelection ? 0 : 1), fixedRowCount: 1, styleTopLeftGrid: STYLE_TOP_LEFT, styleTopRightGrid: styleTopRightGrid, styleBottomLeftGrid: styleBottomLeftGrid, styleBottomRightGrid: STYLE_BOTTOM_RIGHT, noContentRenderer: noContentRenderer, globalScrollListener: globalScrollListener }, Cell)));
    }));
};
export default React.memo(Content);
