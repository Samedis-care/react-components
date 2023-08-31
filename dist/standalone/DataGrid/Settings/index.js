import React, { useCallback } from "react";
import { Collapse } from "@mui/material";
import { useDataGridState, useDataGridStyles, } from "../DataGrid";
import Dialog from "./SettingsDialog";
const DataGridSettings = (props) => {
    const classes = useDataGridStyles();
    const [state, setState] = useDataGridState();
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
    }, [setState]);
    return (React.createElement(Collapse, { className: classes.contentOverlayCollapse, in: state.showSettings },
        React.createElement(Dialog, { columns: props.columns, closeGridSettings: closeGridSettings, toggleColumnLock: toggleColumnLock, toggleColumnVisibility: toggleColumnVisibility, lockedColumns: state.lockedColumns, hiddenColumns: state.hiddenColumns })));
};
export default React.memo(DataGridSettings);
