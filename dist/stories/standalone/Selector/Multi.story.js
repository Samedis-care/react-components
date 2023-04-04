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
import React, { useState, useCallback } from "react";
import "../../../i18n";
import { MultiSelect, getStringLabel, } from "../../../standalone/Selector";
import { colourOptions } from "./Data";
import { action } from "@storybook/addon-actions";
import { boolean, text, select } from "@storybook/addon-knobs";
import { Box, FormControl } from "@material-ui/core";
import CustomMultiSelectEntry from "./CustomMultiSelectEntry";
var enhanceData = function (entry) { return (__assign(__assign({}, entry), { onClick: action("onClick: " + getStringLabel(entry)), canUnselect: function (evtEntry) {
        action("canUnselect: " + getStringLabel(evtEntry))(evtEntry);
        return true;
    }, id: entry.value })); };
var getDefaultData = function () {
    return ["ocean"]
        .map(function (entry) { return colourOptions.find(function (color) { return color.value === entry; }); })
        .filter(function (e) { return e !== undefined; }).map(enhanceData);
};
export var SelectorMulti = function () {
    var _a = useState(getDefaultData), selected = _a[0], setSelected = _a[1];
    var variant = select("TextField mode", {
        outlined: "outlined",
        standard: "standard",
    }, "outlined");
    var loadDataAction = action("onLoad");
    var onSelectAction = action("onSelect");
    var onAddNewAction = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        action("onAddNew")(args);
        return null;
    };
    var label = text("Label", "Example multi select");
    var enableAddNew = boolean("Enable Add New", false);
    var icons = boolean("Enable Icons", false);
    var disabled = boolean("Disable", false);
    var customSelectedRenderer = boolean("Enable Custom Selected Renderer", false);
    var addNewLabel = text("Add new label", "Add");
    var useCustomLoading = boolean("Use custom loading label?", true);
    var loadingLabel = text("Loading Label", "Loading..");
    var useCustomNoOptionsText = boolean("Use custom no data label?", false);
    var noOptionsText = text("No data Label", "No option");
    var useCustomOpenText = boolean("Use custom open text label?", false);
    var openText = text("Open Text Label", "Open");
    var useCustomCloseText = boolean("Use custom close text label?", false);
    var closeText = text("Close Text Label", "Close");
    var placeholderLabel = text("Placeholder Label", "Select..");
    var displaySwitch = boolean("Enable switch?", false);
    var defaultSwitchValue = boolean("Default position for switch", false);
    var switchLabel = text("Switch Label", "All Record");
    var loadData = useCallback(function (query) {
        loadDataAction(query);
        return colourOptions
            .filter(function (option) {
            return getStringLabel(option).toLowerCase().includes(query.toLowerCase());
        })
            .map(enhanceData);
    }, [loadDataAction]);
    var onSelect = useCallback(function (data) {
        onSelectAction(data);
        setSelected(data);
    }, [onSelectAction, setSelected]);
    return (React.createElement(Box, { m: 2 },
        React.createElement(FormControl, { component: "fieldset", fullWidth: true },
            React.createElement(MultiSelect, { label: label, variant: variant, selected: selected, onSelect: onSelect, onLoad: loadData, onAddNew: enableAddNew ? onAddNewAction : undefined, enableIcons: icons, selectedEntryRenderer: customSelectedRenderer ? CustomMultiSelectEntry : undefined, disabled: disabled, addNewLabel: addNewLabel, loadingText: useCustomLoading ? loadingLabel : undefined, noOptionsText: useCustomNoOptionsText ? noOptionsText : undefined, openText: useCustomOpenText ? openText : undefined, closeText: useCustomCloseText ? closeText : undefined, placeholder: placeholderLabel, displaySwitch: displaySwitch, defaultSwitchValue: defaultSwitchValue, switchLabel: switchLabel, autocompleteId: "multi-select" }))));
};
SelectorMulti.storyName = "Multi";
