import React, { useCallback, useEffect, useMemo } from "react";
import { compareArrayContent, MultiSelectWithCheckBox, } from "../..";
import { Checkbox, Divider, FormControlLabel, Grid, Typography, } from "@mui/material";
import { useCustomFilterActiveContext } from "./Header/FilterBar";
import { useDataGridStyles } from "./DataGrid";
const GridMultiSelectFilter = (props) => {
    const { label, options, onSelect, dialog, dialogBreakpoints, barBreakpoints, } = props;
    const classes = useDataGridStyles();
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
    const getSelected = useCallback((values) => {
        return values
            .map((selected) => options.find((option) => option.value === selected)?.label)
            .filter((selected) => selected)
            .join(", ");
    }, [options]);
    const handleSelectorChange = useCallback((event) => {
        onSelect(event.target.value);
    }, [onSelect]);
    const selectorClasses = useMemo(() => ({
        select: isActive ? classes.customFilterBorder : undefined,
    }), [isActive, classes.customFilterBorder]);
    if (dialog) {
        return (React.createElement(Grid, { item: true, xs: 12, md: 6, lg: 3, ...dialogBreakpoints, container: true },
            label && (React.createElement(Grid, { item: true, xs: 12 },
                React.createElement(Typography, null, label))),
            options.map((option) => (React.createElement(Grid, { item: true, xs: 12, key: option.value }, option.isDivider ? (React.createElement(Divider, null)) : option.isSmallLabel ? (React.createElement(Typography, null, option.label)) : (React.createElement(FormControlLabel, { control: React.createElement(Checkbox, { name: option.value, checked: selected.includes(option.value), onChange: handleDialogCheckboxToggle }), label: option.label })))))));
    }
    else {
        return (React.createElement(Grid, { item: true, xs: 4, ...barBreakpoints },
            React.createElement(MultiSelectWithCheckBox, { variant: "outlined", label: label, options: options, values: selected, onChange: handleSelectorChange, renderValue: getSelected, fullWidth: true, classes: selectorClasses })));
    }
};
export default React.memo(GridMultiSelectFilter);
