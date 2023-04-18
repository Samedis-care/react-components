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
import { compareArrayContent, MultiSelectWithCheckBox, } from "../..";
import { Checkbox, FormControlLabel, Grid, Typography } from "@mui/material";
import { useCustomFilterActiveContext } from "./Header/FilterBar";
import { useDataGridStyles } from "./DataGrid";
var GridMultiSelectFilter = function (props) {
    var _a;
    var label = props.label, options = props.options, onSelect = props.onSelect, dialog = props.dialog, dialogBreakpoints = props.dialogBreakpoints, barBreakpoints = props.barBreakpoints;
    var classes = useDataGridStyles();
    var selected = (_a = props.selected) !== null && _a !== void 0 ? _a : props.defaultSelection;
    var isActive = !compareArrayContent(selected, props.defaultSelection);
    var _b = useCustomFilterActiveContext(), setActiveFilter = _b[1];
    useEffect(function () {
        if (!isActive)
            return;
        setActiveFilter(function (prev) { return prev + 1; });
        return function () {
            setActiveFilter(function (prev) { return prev - 1; });
        };
    }, [setActiveFilter, isActive]);
    var handleDialogCheckboxToggle = useCallback(function (evt, checked) {
        onSelect(checked
            ? selected.concat([evt.target.name])
            : selected.filter(function (entry) { return entry !== evt.target.name; }));
    }, [selected, onSelect]);
    var getSelected = useCallback(function (values) {
        return values
            .map(function (selected) { var _a; return (_a = options.find(function (option) { return option.value === selected; })) === null || _a === void 0 ? void 0 : _a.label; })
            .filter(function (selected) { return selected; })
            .join(", ");
    }, [options]);
    var handleSelectorChange = useCallback(function (event) {
        onSelect(event.target.value);
    }, [onSelect]);
    var selectorClasses = useMemo(function () { return ({
        select: isActive ? classes.customFilterBorder : undefined,
    }); }, [isActive, classes.customFilterBorder]);
    if (dialog) {
        return (React.createElement(Grid, __assign({ item: true, xs: 12, md: 6, lg: 3 }, dialogBreakpoints, { container: true, spacing: 2 }),
            label && (React.createElement(Grid, { item: true, xs: 12 },
                React.createElement(Typography, null, label))),
            options.map(function (option) { return (React.createElement(Grid, { item: true, xs: 12, key: option.value },
                React.createElement(FormControlLabel, { control: React.createElement(Checkbox, { name: option.value, checked: selected.includes(option.value), onChange: handleDialogCheckboxToggle }), label: option.label }))); })));
    }
    else {
        return (React.createElement(Grid, __assign({ item: true, xs: 4 }, barBreakpoints),
            React.createElement(MultiSelectWithCheckBox, { label: label, options: options, values: selected, onChange: handleSelectorChange, renderValue: getSelected, fullWidth: true, classes: selectorClasses })));
    }
};
export default React.memo(GridMultiSelectFilter);
