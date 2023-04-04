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
import React, { useCallback, useEffect, useMemo, useRef, } from "react";
import { VariableSizeGrid, } from "react-window";
import { makeStyles } from "@material-ui/core";
var useStyles = makeStyles({
    bottomLeft: {
        // in webkit based browsers:
        // hide the vertical scrollbar, sadly also removes the default styles
        // from the horizontal scrollbar
        "&::-webkit-scrollbar": {
            width: 0,
            height: "auto",
        },
        "&::-webkit-scrollbar-track": {
            background: "white",
        },
        "&::-webkit-scrollbar-thumb": {
            background: "hsl(0, 0%, 60%)",
        },
        // in firefox just hide it completely
        // we can do that because the scrollbar
        // doesn't add to the content width in firefox
        scrollbarWidth: "none",
    },
}, { name: "CcMultiGrid" });
var MultiGrid = function (props) {
    var width = props.width, height = props.height, columnCount = props.columnCount, columnWidth = props.columnWidth, rowCount = props.rowCount, rowHeight = props.rowHeight, onItemsRendered = props.onItemsRendered, fixedColumnCount = props.fixedColumnCount, fixedRowCount = props.fixedRowCount, styleTopLeftGrid = props.styleTopLeftGrid, styleTopRightGrid = props.styleTopRightGrid, styleBottomLeftGrid = props.styleBottomLeftGrid, styleBottomRightGrid = props.styleBottomRightGrid, CellRenderer = props.children, NoContentRenderer = props.noContentRenderer, globalScrollListener = props.globalScrollListener;
    var classes = useStyles();
    var fixedWidth = useMemo(function () {
        return Array.from(new Array(fixedColumnCount).keys()).reduce(function (p, c) { return p + columnWidth(c); }, 0);
    }, [columnWidth, fixedColumnCount]);
    var fixedHeight = useMemo(function () {
        return Array.from(new Array(fixedRowCount).keys()).reduce(function (p, c) { return p + rowHeight(c); }, 0);
    }, [fixedRowCount, rowHeight]);
    var CellRendererTopRight = useCallback(function (props) {
        return CellRenderer(__assign(__assign({}, props), { columnIndex: props.columnIndex + fixedColumnCount }));
    }, [CellRenderer, fixedColumnCount]);
    var CellRendererBottomLeft = useCallback(function (props) {
        return CellRenderer(__assign(__assign({}, props), { rowIndex: props.rowIndex + fixedRowCount }));
    }, [CellRenderer, fixedRowCount]);
    var CellRendererBottomRight = useCallback(function (props) {
        return CellRenderer(__assign(__assign({}, props), { columnIndex: props.columnIndex + fixedColumnCount, rowIndex: props.rowIndex + fixedRowCount }));
    }, [CellRenderer, fixedColumnCount, fixedRowCount]);
    var handleItemsRendered = useCallback(function (params) {
        if (!onItemsRendered)
            return;
        onItemsRendered(__assign(__assign({}, params), { overscanColumnStartIndex: params.overscanColumnStartIndex + fixedColumnCount, overscanColumnStopIndex: params.overscanColumnStopIndex + fixedColumnCount, overscanRowStartIndex: params.overscanRowStartIndex + fixedRowCount, overscanRowStopIndex: params.overscanRowStopIndex + fixedRowCount, visibleColumnStartIndex: params.visibleColumnStartIndex + fixedColumnCount, visibleColumnStopIndex: params.visibleColumnStopIndex + fixedColumnCount, visibleRowStartIndex: params.visibleRowStartIndex + fixedRowCount, visibleRowStopIndex: params.visibleRowStopIndex + fixedRowCount }));
    }, [fixedColumnCount, fixedRowCount, onItemsRendered]);
    var topLeftGrid = useRef(null);
    var topRightGrid = useRef(null);
    var bottomLeftGrid = useRef(null);
    var bottomRightGrid = useRef(null);
    var handleScroll = useCallback(function (evt) {
        var _a, _b;
        (_a = topRightGrid.current) === null || _a === void 0 ? void 0 : _a.scrollTo({ scrollLeft: evt.scrollLeft });
        (_b = bottomLeftGrid.current) === null || _b === void 0 ? void 0 : _b.scrollTo({ scrollTop: evt.scrollTop });
    }, []);
    var handleScrollPinned = useCallback(function (evt) {
        var _a, _b;
        (_a = topLeftGrid.current) === null || _a === void 0 ? void 0 : _a.scrollTo({ scrollLeft: evt.scrollLeft });
        (_b = bottomRightGrid.current) === null || _b === void 0 ? void 0 : _b.scrollTo({ scrollTop: evt.scrollTop });
    }, []);
    useEffect(function () {
        var _a, _b, _c, _d;
        (_a = topLeftGrid.current) === null || _a === void 0 ? void 0 : _a.resetAfterColumnIndex(0, true);
        (_b = topRightGrid.current) === null || _b === void 0 ? void 0 : _b.resetAfterColumnIndex(0, true);
        (_c = bottomLeftGrid.current) === null || _c === void 0 ? void 0 : _c.resetAfterColumnIndex(0, true);
        (_d = bottomRightGrid.current) === null || _d === void 0 ? void 0 : _d.resetAfterColumnIndex(0, true);
    }, [columnWidth]);
    useEffect(function () {
        var _a, _b, _c, _d;
        (_a = topLeftGrid.current) === null || _a === void 0 ? void 0 : _a.resetAfterRowIndex(0, true);
        (_b = topRightGrid.current) === null || _b === void 0 ? void 0 : _b.resetAfterRowIndex(0, true);
        (_c = bottomLeftGrid.current) === null || _c === void 0 ? void 0 : _c.resetAfterRowIndex(0, true);
        (_d = bottomRightGrid.current) === null || _d === void 0 ? void 0 : _d.resetAfterRowIndex(0, true);
    }, [rowHeight]);
    useEffect(function () {
        if (!globalScrollListener)
            return;
        var handleKeyPress = function (evt) {
            if (!["PageDown", "PageUp"].includes(evt.key))
                return;
            evt.preventDefault();
            var rightGrid = bottomRightGrid.current;
            var leftGrid = bottomLeftGrid.current;
            if (!rightGrid || !leftGrid)
                return;
            var scrollStep = height - fixedHeight;
            var scrollCurrent = rightGrid.state.scrollTop;
            if (evt.key === "PageDown") {
                rightGrid.scrollTo({
                    scrollTop: scrollCurrent + scrollStep,
                });
            }
            else if (evt.key === "PageUp") {
                rightGrid.scrollTo({
                    scrollTop: scrollCurrent - scrollStep,
                });
            }
        };
        document.addEventListener("keydown", handleKeyPress);
        return function () { return document.removeEventListener("keydown", handleKeyPress); };
    }, [globalScrollListener, fixedHeight, height]);
    return (React.createElement("div", { style: { position: "relative" } },
        React.createElement(VariableSizeGrid, { ref: topLeftGrid, columnWidth: function (index) { return columnWidth(index); }, rowHeight: function (index) { return rowHeight(index); }, columnCount: fixedColumnCount, rowCount: fixedRowCount, width: Math.min(fixedWidth, width), height: fixedHeight, style: __assign(__assign({}, styleTopLeftGrid), { position: "absolute", top: 0, left: 0 }) }, CellRenderer),
        React.createElement(VariableSizeGrid, { ref: topRightGrid, columnWidth: function (index) { return columnWidth(index + fixedColumnCount); }, rowHeight: function (index) { return rowHeight(index); }, columnCount: columnCount - fixedColumnCount, rowCount: fixedRowCount, width: Math.max(width - fixedWidth, 0), height: fixedHeight, style: __assign(__assign({}, styleTopRightGrid), { position: "absolute", top: 0, left: fixedWidth }) }, CellRendererTopRight),
        React.createElement(VariableSizeGrid, { ref: bottomLeftGrid, columnWidth: function (index) { return columnWidth(index); }, rowHeight: function (index) { return rowHeight(index + fixedRowCount); }, columnCount: fixedColumnCount, rowCount: rowCount - fixedRowCount, width: Math.min(fixedWidth, width), height: height - fixedHeight, onScroll: handleScrollPinned, className: classes.bottomLeft, style: __assign(__assign({}, styleBottomLeftGrid), { position: "absolute", overflow: "scroll", top: fixedHeight, left: 0 }) }, CellRendererBottomLeft),
        rowCount - fixedRowCount > 0 ? (React.createElement(VariableSizeGrid, { ref: bottomRightGrid, columnWidth: function (index) { return columnWidth(index + fixedColumnCount); }, rowHeight: function (index) { return rowHeight(index + fixedRowCount); }, columnCount: columnCount - fixedColumnCount, rowCount: rowCount - fixedRowCount, width: Math.max(width - fixedWidth, 0), height: height - fixedHeight, onScroll: handleScroll, style: __assign(__assign({}, styleBottomRightGrid), { overflowX: "scroll", overflowY: "auto", position: "absolute", top: fixedHeight, left: fixedWidth }), onItemsRendered: onItemsRendered ? handleItemsRendered : undefined }, CellRendererBottomRight)) : (React.createElement("div", { style: __assign(__assign({}, styleBottomRightGrid), { position: "absolute", top: fixedHeight, left: fixedWidth, width: width - fixedWidth, height: height - fixedHeight }) },
            React.createElement(NoContentRenderer, null)))));
};
export default React.memo(MultiGrid);
