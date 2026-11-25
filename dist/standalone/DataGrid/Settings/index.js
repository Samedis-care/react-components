import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useMemo } from "react";
import { DataGridContentOverlayCollapse, useDataGridColumnState, useDataGridProps, useDataGridState, } from "../DataGrid";
import Dialog from "./SettingsDialog";
const DataGridSettings = (props) => {
    const { columns } = props;
    const { classes } = useDataGridProps();
    const [{ showSettings, settingsSearch, columnPinned, columnHidden }, setState,] = useDataGridState();
    const [, setColumnState] = useDataGridColumnState();
    const closeGridSettings = useCallback(() => {
        setState((prevState) => ({
            ...prevState,
            showSettings: false,
        }));
    }, [setState]);
    const toggleColumnLock = useCallback((evt) => {
        const value = evt.target.value;
        setState((prevState) => ({
            ...prevState,
            columnPinned: {
                ...prevState.columnPinned,
                [value]: !prevState.columnPinned[value],
            },
        }));
    }, [setState]);
    const toggleColumnVisibility = useCallback((evt) => {
        const value = evt.target.value;
        setState((prevState) => ({
            ...prevState,
            columnHidden: {
                ...prevState.columnHidden,
                [value]: !prevState.columnHidden[value],
            },
        }));
        // clear column filter on column visibility toggle
        setColumnState((prevState) => ({
            ...prevState,
            [value]: {
                ...prevState[value],
                filter: undefined,
            },
        }));
    }, [setColumnState, setState]);
    // the column search ignores case and the spaces around the query
    const columnQuery = settingsSearch.trim().toLowerCase();
    // a new list only when the columns or the column search change, so the
    // table (memoized, it sorts the list) skips every other grid state change
    const matchingColumns = useMemo(() => columnQuery
        ? columns.filter((col) => col.headerName.toLowerCase().includes(columnQuery))
        : columns, [columns, columnQuery]);
    return (_jsx(DataGridContentOverlayCollapse, { className: classes?.contentOverlayCollapse, in: showSettings, children: _jsx(Dialog, { columns: matchingColumns, closeGridSettings: closeGridSettings, toggleColumnLock: toggleColumnLock, toggleColumnVisibility: toggleColumnVisibility, columnPinned: columnPinned, columnHidden: columnHidden }) }));
};
export default React.memo(DataGridSettings);
