import React, { useCallback } from "react";
import { getDataGridDefaultColumnsState, getDataGridDefaultState, getDefaultColumnWidths, useDataGridColumnState, useDataGridColumnsWidthState, useDataGridProps, useDataGridState, } from "../DataGrid";
import ActionBarView from "./ActionBarView";
import { useTheme } from "@mui/material";
import { useDataGridResetFilters } from "../DataGridUtils";
const ActionBar = () => {
    const [, setState] = useDataGridState();
    const [, setColumnState] = useDataGridColumnState();
    const [, setColumnWidth] = useDataGridColumnsWidthState();
    const { columns, onAddNew, onImport, exporters, filterBar, defaultSort, defaultFilter, defaultCustomData, hideReset, hideSettings, } = useDataGridProps();
    const theme = useTheme();
    const toggleSettings = useCallback(() => {
        setState((prevState) => ({
            ...prevState,
            showSettings: !prevState.showSettings,
            settingsSearch: "",
            showFilterDialog: prevState.showSettings
                ? prevState.showFilterDialog
                : false,
        }));
    }, [setState]);
    const handleResetFilter = useDataGridResetFilters();
    const handleResetSort = useCallback(() => {
        const defaultColumnState = getDataGridDefaultColumnsState(columns, defaultSort, defaultFilter);
        setColumnState((colState) => Object.fromEntries(Object.entries(colState)
            .filter(([field]) => field in defaultColumnState)
            .map(([field, def]) => [
            field,
            {
                ...def,
                sort: defaultColumnState[field].sort,
                sortOrder: defaultColumnState[field].sortOrder,
            },
        ])));
    }, [columns, defaultFilter, defaultSort, setColumnState]);
    const handleResetColumn = useCallback(() => {
        const defaultState = getDataGridDefaultState(columns, defaultCustomData);
        setState((state) => ({
            ...state,
            hiddenColumns: defaultState.hiddenColumns,
            lockedColumns: defaultState.lockedColumns,
        }));
    }, [columns, defaultCustomData, setState]);
    const handleResetWidth = useCallback(() => {
        setColumnWidth(getDefaultColumnWidths(columns, theme));
        setState((state) => ({ ...state, initialResize: false }));
    }, [columns, setColumnWidth, setState, theme]);
    const handleResetAll = useCallback(() => {
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
    const handleRefresh = useCallback(() => {
        setState((prevState) => ({
            ...prevState,
            rows: {},
            refreshData: Math.min(prevState.refreshData + 1, 2),
        }));
    }, [setState]);
    return (React.createElement(ActionBarView, { toggleSettings: hideSettings ? undefined : toggleSettings, hideReset: !!hideReset, handleAddNew: onAddNew, handleImport: onImport, refresh: handleRefresh, resetFilter: handleResetFilter, resetSort: handleResetSort, resetColumn: handleResetColumn, resetWidth: handleResetWidth, resetAll: handleResetAll, exporters: exporters, hasCustomFilterBar: !!filterBar }));
};
export default React.memo(ActionBar);
