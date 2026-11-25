import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useEffect, useRef, useState, } from "react";
import { Grid, useMediaQuery } from "@mui/material";
import { DataGridFilterBarBox, DataGridFilterBarGrid, useDataGridProps, useDataGridState, } from "../DataGrid";
import CustomFiltersButton from "./CustomFiltersButton";
import combineClassNames from "../../../utils/combineClassNames";
/**
 * The default of DataGridProps.enableFilterDialogWidth (in px), used while the
 * grid has a filterBar and sets neither enableFilterDialogWidth nor
 * enableFilterDialogMediaQuery. The helpers (GridSingleSelectFilter and the
 * like) take a third of the bar each by default, so each of them is about
 * 190px wide at this width.
 */
const DEFAULT_FILTER_DIALOG_WIDTH = 600;
const FilterBar = () => {
    const props = useDataGridProps();
    const { enableFilterDialogMediaQuery, filterBar } = props;
    const enableFilterDialogWidth = props.enableFilterDialogWidth ??
        (filterBar && enableFilterDialogMediaQuery == null
            ? DEFAULT_FILTER_DIALOG_WIDTH
            : undefined);
    const { classes } = props;
    const [state, setState] = useDataGridState();
    const filterBarContainer = useRef(null);
    const enableDialogMediaQuery = useMediaQuery(enableFilterDialogMediaQuery ?? "(false)");
    const enableDialogWidthRef = useRef(false);
    const [enableDialogWidth, setEnableDialogWidth] = useState(enableDialogWidthRef.current);
    useEffect(() => {
        if (!enableFilterDialogWidth)
            return;
        const resizeHandler = () => {
            const container = filterBarContainer.current;
            if (!container)
                return;
            const showDialog = container.clientWidth < enableFilterDialogWidth;
            if (showDialog !== enableDialogWidthRef.current) {
                enableDialogWidthRef.current = showDialog;
                setEnableDialogWidth(showDialog);
            }
        };
        const resizeWatcher = new ResizeObserver(resizeHandler);
        if (filterBarContainer.current)
            resizeWatcher.observe(filterBarContainer.current);
        resizeHandler();
        return () => {
            resizeWatcher.disconnect();
        };
    }, [enableFilterDialogWidth]);
    const enableDialog = enableFilterDialogWidth != null
        ? enableDialogWidth
        : enableDialogMediaQuery;
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
    const FilterBarView = filterBar;
    return (_jsx(DataGridFilterBarBox, { sx: { ml: 4 }, className: classes?.filterBarBox, ref: filterBarContainer, children: _jsx(DataGridFilterBarGrid, { container: true, sx: { alignItems: "center", justifyContent: "flex-end" }, spacing: 2, className: combineClassNames([
                classes?.filterBarGrid,
                "components-care-data-grid-filter-bar",
            ]), children: FilterBarView &&
                (enableDialog ? (_jsx(Grid, { children: _jsx(CustomFiltersButton, { onClick: openDialog }) })) : (_jsx(FilterBarView, { customData: state.customData, setCustomData: setCustomData, inDialog: false }))) }) }));
};
export default React.memo(FilterBar);
