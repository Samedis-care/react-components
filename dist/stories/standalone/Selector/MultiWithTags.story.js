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
import React, { useState } from "react";
import "../../../i18n";
import { MultiSelectWithTags, getStringLabel, } from "../../../standalone/Selector";
import { colourOptions, colourTypeOptions } from "./Data";
import { action } from "@storybook/addon-actions";
import { boolean, text } from "@storybook/addon-knobs";
import { useDialogContext } from "../../../framework";
import { showInfoDialog } from "../../../non-standalone";
var enhanceData = function (entry) { return (__assign(__assign({}, entry), { onClick: action("onClick: " + getStringLabel(entry)), canUnselect: function (evtEntry) {
        action("canUnselect: " + getStringLabel(evtEntry))(evtEntry);
        return true;
    } })); };
var options = colourOptions.map(enhanceData);
export var SelectorMultiWithTags = function () {
    var _a = useState([]), selected = _a[0], setSelected = _a[1];
    var title = text("Title", "Select a group");
    var icons = boolean("Enable Icons", false);
    var disable = boolean("Disable", false);
    var useCustomLoading = boolean("Use custom loading label?", true);
    var loadingLabel = text("Loading Label", "Loading..");
    var useCustomNoOptionsText = boolean("Use custom no data label?", false);
    var noOptionsText = text("No data Label", "No option");
    var displaySwitch = boolean("Enable Switch", false);
    var switchLabel = text("Switch Label Text", "Select from all");
    var searchInputLabel = text("Search Label", "or search for a single item");
    var pushDialog = useDialogContext()[0];
    var dialogTitle = text("Dialog title", "Sample title");
    var infoText = text("Info Text", "This is a pretty long info text which supports html. It really is.<br> It explains you what to write in here.");
    var dialogButtonLabel = text("Dialog button label", "Ok");
    var dialogButtonClick = action("onClose");
    var useCustomOpenText = boolean("Use custom open text label?", false);
    var openText = text("Open Text Label", "Open");
    var useCustomCloseText = boolean("Use custom close text label?", false);
    var closeText = text("Close Text Label", "Close");
    return (React.createElement(MultiSelectWithTags, { selected: selected, onChange: setSelected, title: title, loadGroupEntries: function (group) {
            return options.filter(function (option) { return option.type === group.value; });
        }, loadDataOptions: function (query) {
            return options.filter(function (option) {
                return getStringLabel(option).toLowerCase().includes(query.toLowerCase());
            });
        }, loadGroupOptions: function (query) {
            return colourTypeOptions.filter(function (group) {
                return group.label.toLowerCase().includes(query.toLowerCase());
            });
        }, autocompleteId: "multi-select-with-tags", displaySwitch: displaySwitch, switchLabel: switchLabel, enableIcons: icons, disabled: disable, loadingText: useCustomLoading ? loadingLabel : undefined, noOptionsText: useCustomNoOptionsText ? noOptionsText : undefined, openText: useCustomOpenText ? openText : undefined, closeText: useCustomCloseText ? closeText : undefined, searchInputLabel: searchInputLabel, openInfo: function () {
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
        } }));
};
SelectorMultiWithTags.storyName = "MultiWithTags";
