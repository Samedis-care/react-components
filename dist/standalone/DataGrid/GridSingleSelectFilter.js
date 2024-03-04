import React, { useCallback, useEffect, useMemo } from "react";
import { SingleSelect } from "../../standalone/Selector";
import { Divider, FormControl, FormControlLabel, Grid, Radio, RadioGroup, Typography, } from "@mui/material";
import { useCustomFilterActiveContext } from "./Header/FilterBar";
import { useDataGridStyles } from "./DataGrid";
const GridSingleSelectFilter = (props) => {
    const { label, options, onSelect, dialog, autocompleteId, dialogBreakpoints, barBreakpoints, } = props;
    const classes = useDataGridStyles();
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
    const handleDialogRadioToggle = useCallback((_, value) => {
        onSelect(value);
    }, [onSelect]);
    const handleSelectorChange = useCallback((value) => {
        onSelect(value?.value ?? "");
    }, [onSelect]);
    const getOptions = useCallback(() => options, [options]);
    const selectorStyles = useMemo(() => ({
        inputRoot: isActive ? classes.customFilterBorder : undefined,
    }), [isActive, classes.customFilterBorder]);
    if (dialog) {
        return (React.createElement(Grid, { item: true, xs: 12, md: 6, lg: 3, ...dialogBreakpoints },
            React.createElement(FormControl, { component: "fieldset" },
                React.createElement(RadioGroup, { value: selected, onChange: handleDialogRadioToggle },
                    React.createElement(Grid, { item: true, xs: 12, container: true },
                        label && (React.createElement(Grid, { item: true, xs: 12 },
                            React.createElement(Typography, null, label))),
                        options.map((option) => (React.createElement(Grid, { item: true, xs: 12, key: option.value }, option.isDivider ? (React.createElement(Divider, null)) : option.isSmallLabel ? (React.createElement(Typography, null, option.label)) : (React.createElement(FormControlLabel, { control: React.createElement(Radio, null), name: option.value, value: option.value, label: option.label }))))))))));
    }
    else {
        return (React.createElement(Grid, { item: true, xs: 4, ...barBreakpoints },
            React.createElement(FormControl, { component: "fieldset", fullWidth: true },
                React.createElement(SingleSelect, { label: label, disableSearch: true, disableClearable: true, onLoad: getOptions, selected: options.find((option) => option.value === selected) ?? options[0], onSelect: handleSelectorChange, autocompleteId: autocompleteId, classes: selectorStyles }))));
    }
};
export default React.memo(GridSingleSelectFilter);
