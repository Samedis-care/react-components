import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { DataGridContentOverlayCollapse, getDataGridDefaultState, useDataGridProps, useDataGridState, } from "../DataGrid";
import Dialog from "./FilterDialog";
const DataGridCustomFilters = () => {
    const { filterBar, classes, columns, defaultCustomData, hideReset } = useDataGridProps();
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
    // the panel's filters only: "Reset filter" in the header also resets the
    // search and the column filters, and releases an override
    const resetCustomData = useCallback(() => {
        setState((prevState) => ({
            ...prevState,
            customData: getDataGridDefaultState(columns, defaultCustomData)
                .customData,
        }));
    }, [columns, defaultCustomData, setState]);
    if (!filterBar) {
        return _jsx(_Fragment, {});
    }
    return (_jsx(DataGridContentOverlayCollapse, { className: classes?.contentOverlayCollapse, in: state.showFilterDialog, mountOnEnter: true, children: _jsx(Dialog, { closeFilterDialog: closeCustomFilterDialog, resetCustomData: hideReset ? undefined : resetCustomData, customFilters: filterBar, customData: state.customData, setCustomData: setCustomData }) }));
};
export default React.memo(DataGridCustomFilters);
