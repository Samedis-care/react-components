import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useMemo } from "react";
import { Checkbox, Divider, FormControlLabel, Grid, styled, Typography, useThemeProps, } from "@mui/material";
import { useDataGridProps } from "./DataGrid";
import { isDataGridCustomFilterActive } from "./DataGridUtils";
import BaseSelector from "../Selector/BaseSelector";
export const DataGridCustomFilterMulti = styled(BaseSelector, {
    name: "CcDataGrid",
    slot: "customFilterMulti",
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
const GridMultiSelectFilterDialogRoot = styled(Grid, {
    name: "CcGridMultiSelectFilter",
    slot: "dialogRoot",
})({});
const GridMultiSelectFilterBarRoot = styled(Grid, {
    name: "CcGridMultiSelectFilter",
    slot: "barRoot",
})({});
const EMPTY_SELECTION = [];
/**
 * A multi-select for a DataGrid filter bar (DataGridProps.filterBar): a
 * dropdown without search in the header's bar, a checkbox list in the filter
 * panel. It edits the custom data key `field` and takes its default from
 * DataGridProps.defaultCustomData; while its selection differs from that
 * default, the bar outlines it. Only inside a DataGrid (it reads the grid's
 * props context). Theme name CcGridMultiSelectFilter.
 */
const GridMultiSelectFilter = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcGridMultiSelectFilter",
    });
    const { label, options, field, onSelect, dialog, dialogBreakpoints, barBreakpoints, } = props;
    const { classes, defaultCustomData } = useDataGridProps();
    const defaultValue = defaultCustomData?.[field];
    const selected = props.selected ??
        (Array.isArray(defaultValue)
            ? defaultValue
            : EMPTY_SELECTION);
    const isActive = isDataGridCustomFilterActive(selected, defaultValue);
    const handleDialogCheckboxToggle = useCallback((evt, checked) => {
        onSelect(checked
            ? selected.concat([evt.target.name])
            : selected.filter((entry) => entry !== evt.target.name));
    }, [selected, onSelect]);
    const getOptions = useCallback(() => ({ options }), [options]);
    const selectedData = useMemo(() => selected
        .map((value) => options.find((opt) => opt.value === value))
        .filter(Boolean), [selected, options]);
    const handleSelectorChange = useCallback((data) => {
        onSelect(data.map((entry) => entry.value));
    }, [onSelect]);
    const selectorClasses = useMemo(() => ({
        autocomplete: isActive ? "Mui-active" : undefined,
    }), [isActive]);
    if (dialog) {
        return (_jsx(GridMultiSelectFilterDialogRoot, { size: { xs: 12, md: 6, lg: 3, ...dialogBreakpoints }, children: _jsxs(Grid, { container: true, children: [label && (_jsx(Grid, { size: 12, children: _jsx(Typography, { children: label }) })), options.map((option) => (_jsx(Grid, { size: 12, children: option.isDivider ? (_jsx(Divider, {})) : option.isSmallLabel ? (_jsx(Typography, { children: option.label })) : (_jsx(FormControlLabel, { control: _jsx(Checkbox, { name: option.value, checked: selected.includes(option.value), onChange: handleDialogCheckboxToggle }), label: option.label })) }, option.value)))] }) }));
    }
    else {
        return (_jsx(GridMultiSelectFilterBarRoot, { size: { xs: 4, ...barBreakpoints }, children: _jsx(DataGridCustomFilterMulti, { multiple: true, label: label, disableSearch: true, disableClearable: true, onLoad: getOptions, selected: selectedData, onSelect: handleSelectorChange, classes: selectorClasses, className: classes?.customFilterMulti }) }));
    }
};
export default React.memo(GridMultiSelectFilter);
