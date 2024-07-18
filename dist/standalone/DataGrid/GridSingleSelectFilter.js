import React, { useCallback, useEffect, useMemo } from "react";
import { Divider, FormControl, FormControlLabel, Grid, Radio, RadioGroup, styled, Typography, useThemeProps, } from "@mui/material";
import { useCustomFilterActiveContext } from "./Header/FilterBar";
import { DataGridCustomFilterSingle, useDataGridProps } from "./DataGrid";
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
        return (React.createElement(GridSingleSelectFilterDialogRoot, { item: true, xs: 12, md: 6, lg: 3, ...dialogBreakpoints },
            React.createElement(FormControl, { component: "fieldset" },
                React.createElement(RadioGroup, { value: selected, onChange: handleDialogRadioToggle },
                    React.createElement(Grid, { item: true, xs: 12, container: true },
                        label && (React.createElement(Grid, { item: true, xs: 12 },
                            React.createElement(Typography, null, label))),
                        options.map((option) => (React.createElement(Grid, { item: true, xs: 12, key: option.value }, option.isDivider ? (React.createElement(Divider, null)) : option.isSmallLabel ? (React.createElement(Typography, null, option.label)) : (React.createElement(FormControlLabel, { control: React.createElement(Radio, null), name: option.value, value: option.value, label: option.label }))))))))));
    }
    else {
        return (React.createElement(GridSingleSelectFilterBarRoot, { item: true, xs: 4, ...barBreakpoints },
            React.createElement(FormControl, { component: "fieldset", fullWidth: true },
                React.createElement(DataGridCustomFilterSingle, { label: label, disableSearch: true, disableClearable: true, onLoad: getOptions, selected: options.find((option) => option.value === selected) ?? options[0], onSelect: handleSelectorChange, autocompleteId: autocompleteId, classes: selectorStyles, className: classes?.customFilterSingle }))));
    }
};
export default React.memo(GridSingleSelectFilter);
