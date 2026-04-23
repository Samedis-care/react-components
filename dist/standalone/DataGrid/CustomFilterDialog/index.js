import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
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
        return _jsx(_Fragment, {});
    }
    return (_jsx(DataGridContentOverlayCollapse, { className: classes?.contentOverlayCollapse, in: state.showFilterDialog, mountOnEnter: true, children: _jsx(Dialog, { closeFilterDialog: closeCustomFilterDialog, customFilters: filterBar, customData: state.customData, setCustomData: setCustomData }) }));
};
export default React.memo(DataGridCustomFilters);
