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
import { getStringLabel, SingleSelect, } from "../../../standalone/Selector";
import { colourOptions } from "./Data";
import { action } from "@storybook/addon-actions";
import { boolean, text, select } from "@storybook/addon-knobs";
import { Box, FormControl } from "@material-ui/core";
import { showInfoDialog } from "../../../non-standalone";
import { useDialogContext } from "../../../framework";
import { Search as SearchIcon } from "@material-ui/icons";
export var SelectorSingle = function () {
    var _a = useState(null), selected = _a[0], setSelected = _a[1];
    var pushDialog = useDialogContext()[0];
    var variant = select("TextField mode", {
        outlined: "outlined",
        standard: "standard",
    }, "outlined");
    var dialogTitle = text("Dialog title", "Sample title");
    var infoText = text("Info Text", "This is a pretty long info text which supports html. It really is.<br> It explains you what to write in here.");
    var dialogButtonLabel = text("Dialog button label", "Ok");
    var dialogButtonClick = action("onClose");
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
    var label = text("Label", "Example selector");
    var enableAddNew = boolean("Enable Add New", false);
    var disableClearable = boolean("Disable clearable?", false);
    var disableSearch = boolean("Disable search?", false);
    var icons = boolean("Enable Icons", false);
    var disabled = boolean("Disable", false);
    var grouped = boolean("Grouped", false);
    var noGroupLabel = grouped ? text("No Group label", "No group") : "";
    var addNewLabel = text("Add new label", "Add");
    var useCustomLoading = boolean("Use custom loading label?", true);
    var loadingLabel = text("Loading Label", "Loading..");
    var useCustomNoOptionsText = boolean("Use custom no data label?", false);
    var noOptionsText = text("No data Label", "No option");
    var startTypingToSearchText = text("Start typing to search Label", "Start typing to search");
    var placeholderLabel = text("Placeholder Label", "Select..");
    var useCustomOpenText = boolean("Use custom open text label?", false);
    var openText = text("Open Text Label", "Open");
    var useCustomCloseText = boolean("Use custom close text label?", false);
    var closeText = text("Close Text Label", "Close");
    var lru = boolean("Use LRU?", false);
    var startAdornment = boolean("Show start adornment?", false);
    var freeSolo = boolean("Enable freeSolo", false);
    var loadData = useCallback(function (query) {
        loadDataAction(query);
        return colourOptions
            .map(function (entry) { return (__assign(__assign({}, entry), { group: entry.type })); })
            .filter(function (option) {
            return getStringLabel(option).toLowerCase().includes(query.toLowerCase());
        });
    }, [loadDataAction]);
    var onSelect = useCallback(function (data) {
        onSelectAction(data);
        setSelected(data);
    }, [onSelectAction, setSelected]);
    return (React.createElement(Box, { m: 2 },
        React.createElement(FormControl, { component: "fieldset", fullWidth: true },
            React.createElement(SingleSelect, { label: label, variant: variant, selected: selected, onSelect: onSelect, onLoad: loadData, onAddNew: enableAddNew ? onAddNewAction : undefined, enableIcons: icons, disableClearable: disableClearable, disableSearch: disableSearch, disabled: disabled, addNewLabel: addNewLabel, loadingText: useCustomLoading ? loadingLabel : undefined, noOptionsText: useCustomNoOptionsText ? noOptionsText : undefined, startTypingToSearchText: startTypingToSearchText, openText: useCustomOpenText ? openText : undefined, closeText: useCustomCloseText ? closeText : undefined, placeholder: placeholderLabel, autocompleteId: "single-select", grouped: grouped, noGroupLabel: noGroupLabel, lru: lru
                    ? {
                        count: 5,
                        loadData: function (id) {
                            return colourOptions.find(function (opt) { return opt.value === id; });
                        },
                        forceQuery: true,
                        storageKey: "story-single-select-lru",
                    }
                    : undefined, openInfo: function () {
                    return showInfoDialog(pushDialog, {
                        title: dialogTitle,
                        message: (React.createElement("div", { dangerouslySetInnerHTML: {
                                __html: infoText,
                            } })),
                        buttons: [
                            {
                                text: dialogButtonLabel,
                                onClick: dialogButtonClick,
                                autoFocus: true,
                                color: "primary",
                            },
                        ],
                    });
                }, startAdornment: startAdornment ? React.createElement(SearchIcon, { color: "primary" }) : undefined, freeSolo: freeSolo }))));
};
SelectorSingle.storyName = "Single";
