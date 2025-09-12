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
            lockedColumns: prevState.lockedColumns.includes(value)
                ? prevState.lockedColumns.filter((s) => s !== value)
                : [...prevState.lockedColumns, value],
        }));
    }, [setState]);
    const toggleColumnVisibility = useCallback((evt) => {
        const value = evt.target.value;
        setState((prevState) => ({
            ...prevState,
            hiddenColumns: prevState.hiddenColumns.includes(value)
                ? prevState.hiddenColumns.filter((s) => s !== value)
                : [...prevState.hiddenColumns, value],
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
    return (React.createElement(DataGridContentOverlayCollapse, { className: classes?.contentOverlayCollapse, in: state.showSettings },
        React.createElement(Dialog, { columns: props.columns.filter((col) => !state.settingsSearch ||
                col.headerName.toLowerCase().includes(state.settingsSearch)), closeGridSettings: closeGridSettings, toggleColumnLock: toggleColumnLock, toggleColumnVisibility: toggleColumnVisibility, lockedColumns: state.lockedColumns, hiddenColumns: state.hiddenColumns })));
};
export default React.memo(DataGridSettings);
