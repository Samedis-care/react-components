import React, { useCallback, useContext, useEffect, } from "react";
import { Grid, useMediaQuery } from "@mui/material";
import { DataGridFilterBarBox, DataGridFilterBarGrid, useDataGridProps, useDataGridState, } from "../DataGrid";
import CustomFiltersButton from "./CustomFiltersButton";
import combineClassNames from "../../../utils/combineClassNames";
export const CustomFilterActiveContext = React.createContext(undefined);
export const useCustomFilterActiveContext = () => {
    const ctx = useContext(CustomFilterActiveContext);
    if (!ctx)
        throw new Error("Context not set");
    return ctx;
};
const FilterBar = () => {
    const props = useDataGridProps();
    const { classes } = props;
    const [state, setState] = useDataGridState();
    const enableDialog = useMediaQuery(props.enableFilterDialogMediaQuery ?? "(false)");
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
    const openDialog = useCallback(() => {
        setState((prevState) => ({
            ...prevState,
            showFilterDialog: !prevState.showFilterDialog,
            showSettings: prevState.showFilterDialog ? prevState.showSettings : false,
        }));
    }, [setState]);
    // hide dialog if user resizes window
    useEffect(() => {
        if (!enableDialog) {
            setState((prevState) => ({
                ...prevState,
                showFilterDialog: false,
            }));
        }
    }, [enableDialog, setState]);
    const FilterBarView = props.filterBar;
    return (React.createElement(DataGridFilterBarBox, { ml: 4, className: classes?.filterBarBox },
        React.createElement(DataGridFilterBarGrid, { container: true, alignItems: "center", justifyContent: "flex-end", spacing: 2, className: combineClassNames([
                classes?.filterBarGrid,
                "components-care-data-grid-filter-bar",
            ]) }, FilterBarView &&
            (enableDialog ? (React.createElement(Grid, { item: true },
                React.createElement(CustomFiltersButton, { onClick: openDialog }))) : (React.createElement(FilterBarView, { customData: state.customData, setCustomData: setCustomData, inDialog: false }))))));
};
export default React.memo(FilterBar);
