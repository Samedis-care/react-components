import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { DataGridContentOverlayCollapse, useDataGridColumnState, useDataGridProps, useDataGridState, } from "../DataGrid";
import Dialog from "./SettingsDialog";
const DataGridSettings = (props) => {
    const { classes } = useDataGridProps();
    const [state, setState] = useDataGridState();
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
    return (_jsx(DataGridContentOverlayCollapse, { className: classes?.contentOverlayCollapse, in: state.showSettings, children: _jsx(Dialog, { columns: props.columns.filter((col) => !state.settingsSearch ||
                col.headerName.toLowerCase().includes(state.settingsSearch)), closeGridSettings: closeGridSettings, toggleColumnLock: toggleColumnLock, toggleColumnVisibility: toggleColumnVisibility, columnPinned: state.columnPinned, columnHidden: state.columnHidden }) }));
};
export default React.memo(DataGridSettings);
