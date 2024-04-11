import React, { useCallback, useEffect, useMemo } from "react";
import { Checkbox, Divider, FormControlLabel, Grid, Typography, } from "@mui/material";
import { useCustomFilterActiveContext } from "./Header/FilterBar";
import { DataGridCustomFilterMulti, useDataGridProps } from "./DataGrid";
import compareArrayContent from "../../utils/compareArrayContent";
const GridMultiSelectFilter = (props) => {
    const { label, options, onSelect, dialog, dialogBreakpoints, barBreakpoints, } = props;
    const { classes } = useDataGridProps();
    const selected = props.selected ?? props.defaultSelection;
    const isActive = !compareArrayContent(selected, props.defaultSelection);
    const [, setActiveFilter] = useCustomFilterActiveContext();
    useEffect(() => {
        if (!isActive)
            return;
        setActiveFilter((prev) => prev + 1);
        return () => {
            setActiveFilter((prev) => prev - 1);
        };
    }, [setActiveFilter, isActive]);
    const handleDialogCheckboxToggle = useCallback((evt, checked) => {
        onSelect(checked
            ? selected.concat([evt.target.name])
            : selected.filter((entry) => entry !== evt.target.name));
    }, [selected, onSelect]);
    const getOptions = useCallback(() => options, [options]);
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
        return (React.createElement(Grid, { item: true, xs: 12, md: 6, lg: 3, ...dialogBreakpoints, container: true },
            label && (React.createElement(Grid, { item: true, xs: 12 },
                React.createElement(Typography, null, label))),
            options.map((option) => (React.createElement(Grid, { item: true, xs: 12, key: option.value }, option.isDivider ? (React.createElement(Divider, null)) : option.isSmallLabel ? (React.createElement(Typography, null, option.label)) : (React.createElement(FormControlLabel, { control: React.createElement(Checkbox, { name: option.value, checked: selected.includes(option.value), onChange: handleDialogCheckboxToggle }), label: option.label })))))));
    }
    else {
        return (React.createElement(Grid, { item: true, xs: 4, ...barBreakpoints },
            React.createElement(DataGridCustomFilterMulti, { multiple: true, label: label, disableSearch: true, disableClearable: true, onLoad: getOptions, selected: selectedData, onSelect: handleSelectorChange, classes: selectorClasses, className: classes?.customFilterMulti })));
    }
};
export default React.memo(GridMultiSelectFilter);
