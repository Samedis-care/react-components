import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useEffect, useMemo } from "react";
import { Divider, FormControl, FormControlLabel, Grid, Radio, RadioGroup, styled, Typography, useThemeProps, } from "@mui/material";
import { useCustomFilterActiveContext } from "./Header/FilterBar";
import { useDataGridProps } from "./DataGrid";
import SingleSelect from "../Selector/SingleSelect";
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
const GridSingleSelectFilter = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcGridSingleSelectFilter",
    });
    const { label, options, onSelect, dialog, autocompleteId, dialogBreakpoints, barBreakpoints, } = props;
    const { classes } = useDataGridProps();
    const selected = props.selected ?? props.defaultSelection;
    const isActive = selected !== props.defaultSelection;
    const [, setActiveFilter] = useCustomFilterActiveContext();
    useEffect(() => {
        if (!isActive)
            return;
        setActiveFilter((prev) => prev + 1);
        return () => {
            setActiveFilter((prev) => prev - 1);
        };
    }, [setActiveFilter, isActive]);
    const handleDialogRadioToggle = useCallback((_evt, value) => {
        onSelect(value);
    }, [onSelect]);
    const handleSelectorChange = useCallback((value) => {
        onSelect(value?.value ?? "");
    }, [onSelect]);
    const getOptions = useCallback(() => options, [options]);
    const selectorStyles = useMemo(() => ({
        autocomplete: isActive ? "Mui-active" : undefined,
    }), [isActive]);
    if (dialog) {
        return (_jsx(GridSingleSelectFilterDialogRoot, { size: { xs: 12, md: 6, lg: 3, ...dialogBreakpoints }, children: _jsx(FormControl, { component: "fieldset", children: _jsx(RadioGroup, { value: selected, onChange: handleDialogRadioToggle, children: _jsxs(Grid, { container: true, size: 12, children: [label && (_jsx(Grid, { size: 12, children: _jsx(Typography, { children: label }) })), options.map((option) => (_jsx(Grid, { size: 12, children: option.isDivider ? (_jsx(Divider, {})) : option.isSmallLabel ? (_jsx(Typography, { children: option.label })) : (_jsx(FormControlLabel, { control: _jsx(Radio, {}), name: option.value, value: option.value, label: option.label })) }, option.value)))] }) }) }) }));
    }
    else {
        return (_jsx(GridSingleSelectFilterBarRoot, { size: { xs: 4, ...barBreakpoints }, children: _jsx(FormControl, { component: "fieldset", fullWidth: true, children: _jsx(DataGridCustomFilterSingle, { label: label, disableSearch: true, disableClearable: true, onLoad: getOptions, selected: options.find((option) => option.value === selected) ?? options[0], onSelect: handleSelectorChange, autocompleteId: autocompleteId, classes: selectorStyles, className: classes?.customFilterSingle }) }) }));
    }
};
export default React.memo(GridSingleSelectFilter);
