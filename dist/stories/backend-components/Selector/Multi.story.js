import React, { useState, useCallback } from "react";
import "../../../i18n";
import { action } from "@storybook/addon-actions";
import { boolean, number, text } from "@storybook/addon-knobs";
import { Box } from "@material-ui/core";
import CustomMultiSelectEntry from "../../standalone/Selector/CustomMultiSelectEntry";
import BackendMultiSelect from "../../../backend-components/Selector/BackendMultiSelect";
import TestModelInstance from "../DataGrid/TestModel";
export var SelectorMulti = function () {
    var _a = useState([]), selected = _a[0], setSelected = _a[1];
    var onSelectAction = action("onSelect");
    var onAddNewAction = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        action("onAddNew")(args);
        return null;
    };
    var enableAddNew = boolean("Enable Add New", false);
    var icons = boolean("Enable Icons", false);
    var disabled = boolean("Disable", false);
    var customSelectedRenderer = boolean("Enable Custom Selected Renderer", false);
    var searchResultLimit = number("Search result limit", 25);
    var addNewLabel = text("Add new label", "Add");
    var loadingText = text("Loading Text", "Loading..");
    var noOptionsText = text("No data Label", "No option");
    var placeholderLabel = text("Placeholder Label", "Select..");
    var onSelect = useCallback(function (data) {
        onSelectAction(data);
        setSelected(data);
    }, [onSelectAction, setSelected]);
    var modelToSelectorData = useCallback(function (data) { return ({
        value: data.id,
        label: "".concat(data.first_name, " ").concat(data.last_name),
        icon: data.avatar ? (React.createElement("img", { alt: "", src: data.avatar })) : undefined,
    }); }, []);
    return (React.createElement(Box, { m: 2 },
        React.createElement(BackendMultiSelect, { model: TestModelInstance, modelToSelectorData: modelToSelectorData, searchResultLimit: searchResultLimit, selected: selected, onSelect: onSelect, onAddNew: enableAddNew ? onAddNewAction : undefined, enableIcons: icons, selectedEntryRenderer: customSelectedRenderer ? CustomMultiSelectEntry : undefined, disabled: disabled, addNewLabel: addNewLabel, loadingText: loadingText, noOptionsText: noOptionsText, placeholder: placeholderLabel, autocompleteId: "multi-select" })));
};
SelectorMulti.storyName = "Multi";
