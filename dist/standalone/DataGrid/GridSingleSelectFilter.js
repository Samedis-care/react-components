var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React, { useCallback, useEffect, useMemo } from "react";
import { SingleSelect } from "../..";
import { FormControl, FormControlLabel, Grid, Radio, RadioGroup, Typography, } from "@mui/material";
import { useCustomFilterActiveContext } from "./Header/FilterBar";
import { useDataGridStyles } from "./DataGrid";
var GridSingleSelectFilter = function (props) {
    var _a, _b;
    var label = props.label, options = props.options, onSelect = props.onSelect, dialog = props.dialog, autocompleteId = props.autocompleteId, dialogBreakpoints = props.dialogBreakpoints, barBreakpoints = props.barBreakpoints;
    var classes = useDataGridStyles();
    var selected = (_a = props.selected) !== null && _a !== void 0 ? _a : props.defaultSelection;
    var isActive = selected !== props.defaultSelection;
    var _c = useCustomFilterActiveContext(), setActiveFilter = _c[1];
    useEffect(function () {
        if (!isActive)
            return;
        setActiveFilter(function (prev) { return prev + 1; });
        return function () {
            setActiveFilter(function (prev) { return prev - 1; });
        };
    }, [setActiveFilter, isActive]);
    var handleDialogRadioToggle = useCallback(function (_, value) {
        onSelect(value);
    }, [onSelect]);
    var handleSelectorChange = useCallback(function (value) {
        var _a;
        onSelect((_a = value === null || value === void 0 ? void 0 : value.value) !== null && _a !== void 0 ? _a : "");
    }, [onSelect]);
    var getOptions = useCallback(function () { return options; }, [options]);
    var selectorStyles = useMemo(function () { return ({
        inputRoot: isActive ? classes.customFilterBorder : undefined,
    }); }, [isActive, classes.customFilterBorder]);
    if (dialog) {
        return (React.createElement(Grid, __assign({ item: true, xs: 12, md: 6, lg: 3 }, dialogBreakpoints),
            React.createElement(FormControl, { component: "fieldset" },
                React.createElement(RadioGroup, { value: selected, onChange: handleDialogRadioToggle },
                    React.createElement(Grid, { item: true, xs: 12, container: true, spacing: 2 },
                        label && (React.createElement(Grid, { item: true, xs: 12 },
                            React.createElement(Typography, null, label))),
                        options.map(function (option) { return (React.createElement(Grid, { item: true, xs: 12, key: option.value },
                            React.createElement(FormControlLabel, { control: React.createElement(Radio, null), name: option.value, value: option.value, label: option.label }))); }))))));
    }
    else {
        return (React.createElement(Grid, __assign({ item: true, xs: 4 }, barBreakpoints),
            React.createElement(FormControl, { component: "fieldset", fullWidth: true },
                React.createElement(SingleSelect, { label: label, disableSearch: true, disableClearable: true, onLoad: getOptions, selected: (_b = options.find(function (option) { return option.value === selected; })) !== null && _b !== void 0 ? _b : options[0], onSelect: handleSelectorChange, autocompleteId: autocompleteId, classes: selectorStyles }))));
    }
};
export default React.memo(GridSingleSelectFilter);
