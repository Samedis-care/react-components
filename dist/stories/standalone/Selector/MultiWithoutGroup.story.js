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
import { MultiSelectWithoutGroup, getStringLabel, } from "../../../standalone/Selector";
import { colourOptions } from "./Data";
import { action } from "@storybook/addon-actions";
import { boolean, number, text } from "@storybook/addon-knobs";
import { useDialogContext } from "../../../framework";
import { showInfoDialog } from "../../../non-standalone";
var enhanceData = function (entry) { return (__assign(__assign({}, entry), { onClick: action("onClick: ".concat(getStringLabel(entry))), canUnselect: function (evtEntry) {
        action("canUnselect: ".concat(getStringLabel(evtEntry)))(evtEntry);
        return true;
    }, id: entry.value })); };
var options = colourOptions.map(enhanceData);
export var MultiWithoutGroup = function () {
    var _a = useState([]), selected = _a[0], setSelected = _a[1];
    var _b = useState(false), switchValue = _b[0], setSwitchValue = _b[1];
    var onSelectAction = action("onSelect");
    var title = text("Title", "Multi Without Groups");
    var icons = boolean("Enable Icons", false);
    var disabled = boolean("Disable", false);
    var pushDialog = useDialogContext()[0];
    var dialogTitle = text("Dialog title", "Sample title");
    var infoText = text("Info Text", "This is a pretty long info text which supports html. It really is.<br> It explains you what to write in here.");
    var dialogButtonLabel = text("Dialog button label", "Ok");
    var dialogButtonClick = action("onClose");
    var useCustomLoadingLabel = boolean("Use custom loading label?", true);
    var loadingLabel = text("Loading Label", "Loading..");
    var useCustomNoOptionsText = boolean("Use custom no data label?", false);
    var noOptionsText = text("No data Label", "No option");
    var displaySwitch = boolean("Enable Switch?", true);
    var switchLabel = text("Switch Label", "Bright colours");
    var onSelect = useCallback(function (data) {
        onSelectAction(data);
        setSelected(data);
    }, [onSelectAction, setSelected]);
    var brightColours = ["ocean", "yellow", "green", "silver"];
    var useLru = boolean("use LRU", false);
    var count = number("Maximum number of LRU-options", 5, {
        range: true,
        min: 1,
        max: 25,
        step: 1,
    });
    var forceQuery = boolean("forceQuery", false);
    var lru = useLru
        ? {
            count: count,
            loadData: function (id) {
                return options.find(function (entry) {
                    return entry.id === id;
                });
            },
            storageKey: "test-storage-key",
            forceQuery: forceQuery,
        }
        : undefined;
    return (React.createElement(MultiSelectWithoutGroup, { label: title, selected: selected, onSelect: onSelect, loadDataOptions: function (query, switchValue) {
            action("onLoad")(query, switchValue);
            return options.filter(function (option) {
                return getStringLabel(option)
                    .toLowerCase()
                    .includes(query.toLowerCase()) &&
                    (switchValue ? brightColours.includes(option.value) : true);
            });
        }, autocompleteId: "multi-select-without-group", enableIcons: icons, disabled: disabled, loadingText: useCustomLoadingLabel ? loadingLabel : undefined, noOptionsText: useCustomNoOptionsText ? noOptionsText : undefined, displaySwitch: displaySwitch, switchLabel: switchLabel, switchValue: switchValue, setSwitchValue: setSwitchValue, openInfo: function () {
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
        }, lru: lru }));
};
MultiWithoutGroup.storyName = "MultiWithoutGroup";
