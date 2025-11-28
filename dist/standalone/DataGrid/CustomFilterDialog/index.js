import React, { useCallback } from "react";
import { DataGridContentOverlayCollapse, useDataGridProps, useDataGridState, } from "../DataGrid";
import Dialog from "./FilterDialog";
const DataGridCustomFilters = () => {
    const { filterBar, classes } = useDataGridProps();
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
    return (React.createElement(DataGridContentOverlayCollapse, { className: classes?.contentOverlayCollapse, in: state.showFilterDialog, mountOnEnter: true },
        React.createElement(Dialog, { closeFilterDialog: closeCustomFilterDialog, customFilters: filterBar, customData: state.customData, setCustomData: setCustomData })));
};
export default React.memo(DataGridCustomFilters);
