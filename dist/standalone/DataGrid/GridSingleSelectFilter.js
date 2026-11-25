import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useMemo } from "react";
import { getReactLabel } from "../../standalone/Selector";
import { Divider, FormControl, FormControlLabel, Grid, Radio, RadioGroup, styled, Typography, useThemeProps, } from "@mui/material";
import { useDataGridProps } from "./DataGrid";
import { isDataGridCustomFilterActive } from "./DataGridUtils";
import SingleSelect from "../Selector/SingleSelect";
import useFilterPanelLists from "./CustomFilterDialog/useFilterPanelLists";
export const DataGridCustomFilterSingle = styled(SingleSelect, {
    name: "CcDataGrid",
    slot: "customFilterSingle",
})(({ theme }) => ({
    "& .MuiAutocomplete-root.Mui-active": {
        borderColor: theme.palette.secondary.main,
        "& > fieldset": {
            borderColor: theme.palette.secondary.main,
        },
        "& .MuiAutocomplete-inputRoot": {
            borderColor: theme.palette.secondary.main,
            "& > fieldset": {
                borderColor: theme.palette.secondary.main,
            },
        },
    },
}));
const GridSingleSelectFilterDialogRoot = styled(Grid, {
    name: "CcGridSingleSelectFilter",
    slot: "dialogRoot",
})({});
const GridSingleSelectFilterBarRoot = styled(Grid, {
    name: "CcGridSingleSelectFilter",
    slot: "barRoot",
})({});
/**
 * A single select for a DataGrid filter bar (DataGridProps.filterBar): a
 * dropdown without search in the header's bar, a radio list in the filter
 * panel, and the bar's dropdown in the panel on a phone (the theme's xs
 * breakpoint). It edits the custom data key `field` and takes its default
 * from DataGridProps.defaultCustomData; while its selection differs from that
 * default, the dropdown is outlined. Only inside a DataGrid (it reads the
 * grid's props context). Theme name CcGridSingleSelectFilter.
 */
const GridSingleSelectFilter = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcGridSingleSelectFilter",
    });
    const { label, options, field, onSelect, dialog, autocompleteId, dialogBreakpoints, barBreakpoints, } = props;
    const { classes, defaultCustomData } = useDataGridProps();
    const defaultValue = defaultCustomData?.[field];
    const selected = props.selected ?? (typeof defaultValue === "string" ? defaultValue : "");
    const isActive = isDataGridCustomFilterActive(selected, defaultValue);
    const showList = useFilterPanelLists(dialog);
    const handleDialogRadioToggle = useCallback((_evt, value) => {
        onSelect(value);
    }, [onSelect]);
    const handleSelectorChange = useCallback((value) => {
        onSelect(value?.value ?? "");
    }, [onSelect]);
    const getOptions = useCallback(() => ({ options }), [options]);
    // the panel's radios: hidden entries are left out, as in the bar's list
    const shownOptions = useMemo(() => options.filter((option) => !option.hidden), [options]);
    const selectorStyles = useMemo(() => ({
        autocomplete: isActive ? "Mui-active" : undefined,
    }), [isActive]);
    if (showList) {
        return (_jsx(GridSingleSelectFilterDialogRoot, { size: { xs: 12, md: 6, lg: 3, ...dialogBreakpoints }, children: _jsx(FormControl, { component: "fieldset", children: _jsx(RadioGroup, { value: selected, onChange: handleDialogRadioToggle, children: _jsxs(Grid, { container: true, size: 12, children: [label && (_jsx(Grid, { size: 12, children: _jsx(Typography, { children: label }) })), shownOptions.map((option) => (_jsx(Grid, { size: 12, children: option.isDivider ? (_jsx(Divider, {})) : option.isSmallLabel ? (_jsx(Typography, { children: getReactLabel(option) })) : (_jsx(FormControlLabel, { control: _jsx(Radio, {}), value: option.value, label: getReactLabel(option), disabled: option.isDisabled })) }, option.value)))] }) }) }) }));
    }
    // the bar's select, also in the panel on a phone
    const selector = (_jsx(FormControl, { component: "fieldset", fullWidth: true, children: _jsx(DataGridCustomFilterSingle, { label: label, disableSearch: true, disableClearable: true, onLoad: getOptions, selected: options.find((option) => option.value === selected) ?? options[0], onSelect: handleSelectorChange, 
            // the panel stays mounted once opened, also after the grid has
            // switched back to the bar: an id there would occur twice
            autocompleteId: dialog ? undefined : autocompleteId, classes: selectorStyles, className: classes?.customFilterSingle }) }));
    return dialog ? (_jsx(GridSingleSelectFilterDialogRoot, { size: { xs: 12, md: 6, lg: 3, ...dialogBreakpoints }, children: selector })) : (_jsx(GridSingleSelectFilterBarRoot, { size: { xs: 4, ...barBreakpoints }, children: selector }));
};
export default React.memo(GridSingleSelectFilter);
