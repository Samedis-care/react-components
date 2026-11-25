import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { getDataGridDefaultColumnsState, getDataGridDefaultState, getDefaultColumnWidths, useDataGridColumnState, useDataGridColumnsWidthState, useDataGridProps, useDataGridState, } from "../DataGrid";
import ActionBarView from "./ActionBarView";
import { useTheme } from "@mui/material";
import { useDataGridResetFilters } from "../DataGridUtils";
const ActionBar = () => {
    const [{ columnHidden }, setState] = useDataGridState();
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
    // Reset column settings: hidden and pinned go back to the column
    // definitions. A column this hides again drops its filter, as unticking
    // "Visible" in the settings does: no header would show that filter anymore.
    const handleResetColumn = useCallback(() => {
        const defaultState = getDataGridDefaultState(columns, defaultCustomData);
        setState((state) => ({
            ...state,
            columnHidden: defaultState.columnHidden,
            columnPinned: defaultState.columnPinned,
        }));
        const hiddenAgain = columns
            .map((column) => column.field)
            .filter((field) => defaultState.columnHidden[field] && !columnHidden[field]);
        if (hiddenAgain.length === 0)
            return;
        setColumnState((colState) => {
            const filtered = hiddenAgain.filter((field) => colState[field]?.filter);
            if (filtered.length === 0)
                return colState;
            const next = { ...colState };
            for (const field of filtered) {
                next[field] = { ...colState[field], filter: undefined };
            }
            return next;
        });
    }, [columnHidden, columns, defaultCustomData, setColumnState, setState]);
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
    return (_jsx(ActionBarView, { toggleSettings: hideSettings ? undefined : toggleSettings, hideReset: !!hideReset, handleAddNew: onAddNew, handleImport: onImport, refresh: handleRefresh, resetFilter: handleResetFilter, resetSort: handleResetSort, resetColumn: handleResetColumn, resetWidth: handleResetWidth, resetAll: handleResetAll, exporters: exporters, hasCustomFilterBar: !!filterBar }));
};
export default React.memo(ActionBar);
