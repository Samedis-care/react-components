import React, { useCallback } from "react";
import { Collapse } from "@mui/material";
import { useDataGridProps, useDataGridState, useDataGridStyles, } from "../DataGrid";
import Dialog from "./FilterDialog";
const DataGridCustomFilters = () => {
    const classes = useDataGridStyles();
    const { filterBar } = useDataGridProps();
    const [state, setState] = useDataGridState();
    const closeCustomFilterDialog = useCallback(() => {
        setState((prevState) => ({
            ...prevState,
            showFilterDialog: false,
        }));
    }, [setState]);
    const setCustomData = useCallback((newState) => {
        if (typeof newState === "function") {
            setState((prevState) => ({
                ...prevState,
                customData: newState(prevState.customData),
            }));
        }
        else {
            setState((prevState) => ({
                ...prevState,
                customData: newState,
            }));
        }
    }, [setState]);
    if (!filterBar) {
        return React.createElement(React.Fragment, null);
    }
    return (React.createElement(Collapse, { className: classes.contentOverlayCollapse, in: state.showFilterDialog },
        React.createElement(Dialog, { closeFilterDialog: closeCustomFilterDialog, customFilters: filterBar, customData: state.customData, setCustomData: setCustomData })));
};
export default React.memo(DataGridCustomFilters);
