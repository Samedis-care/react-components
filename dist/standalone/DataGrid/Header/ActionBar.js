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
import React, { useCallback } from "react";
import { getDataGridDefaultColumnsState, getDataGridDefaultState, getDefaultColumnWidths, useDataGridColumnState, useDataGridColumnsWidthState, useDataGridProps, useDataGridState, } from "../DataGrid";
import ActionBarView from "./ActionBarView";
import { useTheme } from "@material-ui/core";
var ActionBar = function () {
    var _a = useDataGridState(), setState = _a[1];
    var _b = useDataGridColumnState(), setColumnState = _b[1];
    var _c = useDataGridColumnsWidthState(), setColumnWidth = _c[1];
    var _d = useDataGridProps(), columns = _d.columns, onAddNew = _d.onAddNew, onImport = _d.onImport, exporters = _d.exporters, filterBar = _d.filterBar, defaultSort = _d.defaultSort, defaultFilter = _d.defaultFilter, defaultCustomData = _d.defaultCustomData;
    var theme = useTheme();
    var toggleSettings = useCallback(function () {
        setState(function (prevState) { return (__assign(__assign({}, prevState), { showSettings: !prevState.showSettings, showFilterDialog: prevState.showSettings
                ? prevState.showFilterDialog
                : false })); });
    }, [setState]);
    var handleResetFilter = useCallback(function () {
        var defaultState = getDataGridDefaultState(columns, defaultCustomData);
        var defaultColumnState = getDataGridDefaultColumnsState(columns, defaultSort, defaultFilter);
        setState(function (state) { return (__assign(__assign({}, state), { search: defaultState.search, customData: defaultState.customData })); });
        setColumnState(function (colState) {
            return Object.fromEntries(Object.entries(colState).map(function (_a) {
                var _b;
                var field = _a[0], def = _a[1];
                return [
                    field,
                    __assign(__assign({}, def), { filter: (_b = defaultColumnState[field]) === null || _b === void 0 ? void 0 : _b.filter }),
                ];
            }));
        });
    }, [
        columns,
        defaultCustomData,
        defaultFilter,
        defaultSort,
        setColumnState,
        setState,
    ]);
    var handleResetSort = useCallback(function () {
        var defaultColumnState = getDataGridDefaultColumnsState(columns, defaultSort, defaultFilter);
        setColumnState(function (colState) {
            return Object.fromEntries(Object.entries(colState)
                .filter(function (_a) {
                var field = _a[0];
                return field in defaultColumnState;
            })
                .map(function (_a) {
                var field = _a[0], def = _a[1];
                return [
                    field,
                    __assign(__assign({}, def), { sort: defaultColumnState[field].sort, sortOrder: defaultColumnState[field].sortOrder }),
                ];
            }));
        });
    }, [columns, defaultFilter, defaultSort, setColumnState]);
    var handleResetColumn = useCallback(function () {
        var defaultState = getDataGridDefaultState(columns, defaultCustomData);
        setState(function (state) { return (__assign(__assign({}, state), { hiddenColumns: defaultState.hiddenColumns, lockedColumns: defaultState.lockedColumns })); });
    }, [columns, defaultCustomData, setState]);
    var handleResetWidth = useCallback(function () {
        setColumnWidth(getDefaultColumnWidths(columns, theme));
        setState(function (state) { return (__assign(__assign({}, state), { initialResize: false })); });
    }, [columns, setColumnWidth, setState, theme]);
    var handleResetAll = useCallback(function () {
        setState(getDataGridDefaultState(columns, defaultCustomData));
        setColumnState(getDataGridDefaultColumnsState(columns, defaultSort, defaultFilter));
        setColumnWidth(getDefaultColumnWidths(columns, theme));
    }, [
        setState,
        columns,
        defaultCustomData,
        setColumnState,
        defaultSort,
        defaultFilter,
        setColumnWidth,
        theme,
    ]);
    var handleRefresh = useCallback(function () {
        setState(function (prevState) { return (__assign(__assign({}, prevState), { rows: {}, refreshData: Math.min(prevState.refreshData + 1, 2) })); });
    }, [setState]);
    return (React.createElement(ActionBarView, { toggleSettings: toggleSettings, handleAddNew: onAddNew, handleImport: onImport, refresh: handleRefresh, resetFilter: handleResetFilter, resetSort: handleResetSort, resetColumn: handleResetColumn, resetWidth: handleResetWidth, resetAll: handleResetAll, exporters: exporters, hasCustomFilterBar: !!filterBar }));
};
export default React.memo(ActionBar);
