var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useCallback, useEffect, useState } from "react";
import { Box, makeStyles, Typography } from "@material-ui/core";
import { SingleSelect, } from "../../standalone/Selector";
import MultiSelectWithoutGroup from "./MultiSelectWithoutGroup";
import { uniqueArray } from "../../utils";
import Loader from "../Loader";
var useStyles = makeStyles({
    root: {
        position: "relative",
    },
    loadOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: "rgba(255,255,255,.3)",
        transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1) 500ms",
    },
}, { name: "CcMultiSelectWithTags" });
var MultiSelectWithTags = function (props) {
    var _a;
    var title = props.title, searchInputLabel = props.searchInputLabel, selected = props.selected, disabled = props.disabled, autocompleteId = props.autocompleteId, enableIcons = props.enableIcons, noOptionsText = props.noOptionsText, loadingText = props.loadingText, openText = props.openText, closeText = props.closeText, loadGroupEntries = props.loadGroupEntries, loadGroupOptions = props.loadGroupOptions, loadDataOptions = props.loadDataOptions, onChange = props.onChange, openInfo = props.openInfo, getIdOfData = props.getIdOfData, switchLabel = props.switchLabel, lruGroup = props.lruGroup, lruData = props.lruData, sortCompareFn = props.sortCompareFn;
    var defaultSwitchValue = props.displaySwitch
        ? (_a = props.defaultSwitchValue) !== null && _a !== void 0 ? _a : false
        : false;
    var _b = useState([]), selectedGroups = _b[0], setSelectedGroups = _b[1];
    var _c = useState(defaultSwitchValue), switchValue = _c[0], setSwitchValue = _c[1];
    var _d = useState(false), loadingGroupRecords = _d[0], setLoadingGroupRecords = _d[1];
    var getIdDefault = useCallback(function (data) { return data.value; }, []);
    var getId = getIdOfData !== null && getIdOfData !== void 0 ? getIdOfData : getIdDefault;
    var classes = useStyles();
    // set switch value if switch visibility is toggled
    useEffect(function () {
        setSwitchValue(defaultSwitchValue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [!!props.displaySwitch]);
    // remove selected groups if an item has been unselected
    useEffect(function () {
        var selectedIds = selected.map(getId);
        setSelectedGroups(function (oldSelectedGroups) {
            return oldSelectedGroups.filter(function (group) { return !group.items.find(function (item) { return !selectedIds.includes(item); }); });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected]);
    var handleGroupSelect = useCallback(function (selectedGroup) { return __awaiter(void 0, void 0, void 0, function () {
        var groupEntries, groupEntryIds_1, combinedArray_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedGroup || !onChange)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    setLoadingGroupRecords(true);
                    return [4 /*yield*/, loadGroupEntries(selectedGroup)];
                case 2:
                    groupEntries = _a.sent();
                    groupEntryIds_1 = groupEntries.map(getId);
                    combinedArray_1 = __spreadArray(__spreadArray([], selected, true), groupEntries, true);
                    setSelectedGroups(function (prevState) { return __spreadArray(__spreadArray([], prevState, true), [
                        {
                            group: selectedGroup.value,
                            items: groupEntryIds_1,
                        },
                    ], false); });
                    onChange(uniqueArray(combinedArray_1
                        .map(getId)
                        .map(function (value) {
                        return combinedArray_1.find(function (entry) { return getId(entry) === value; });
                    })));
                    return [3 /*break*/, 4];
                case 3:
                    setLoadingGroupRecords(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [onChange, loadGroupEntries, getId, selected]);
    var loadGroupOptionsAndProcess = useCallback(function (query) { return __awaiter(void 0, void 0, void 0, function () {
        var selectedGroupIds;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    selectedGroupIds = selectedGroups.map(function (group) { return group.group; });
                    return [4 /*yield*/, loadGroupOptions(query, switchValue)];
                case 1: return [2 /*return*/, (_a.sent()).filter(function (group) { return !selectedGroupIds.includes(group.value); })];
            }
        });
    }); }, [loadGroupOptions, selectedGroups, switchValue]);
    return (React.createElement("div", { className: classes.root },
        React.createElement("div", { className: classes.loadOverlay, style: loadingGroupRecords
                ? { visibility: "visible", opacity: 1 }
                : { visibility: "hidden", opacity: 0 } },
            React.createElement(Loader, null)),
        React.createElement(Typography, { component: "label", variant: "caption", color: "textSecondary" }, title),
        React.createElement(SingleSelect, { autocompleteId: autocompleteId ? autocompleteId + "-group-select" : undefined, selected: null, onSelect: handleGroupSelect, refreshToken: selectedGroups.length.toString(), onLoad: loadGroupOptionsAndProcess, disabled: disabled || loadingGroupRecords, enableIcons: enableIcons, noOptionsText: noOptionsText, loadingText: loadingText, openText: openText, closeText: closeText, lru: lruGroup }),
        React.createElement(Box, { pt: 3 },
            React.createElement(MultiSelectWithoutGroup, { autocompleteId: autocompleteId, selected: selected, disabled: disabled, label: searchInputLabel, enableIcons: enableIcons, switchValue: switchValue, setSwitchValue: setSwitchValue, switchLabel: switchLabel, displaySwitch: props.displaySwitch, loadDataOptions: loadDataOptions, openInfo: openInfo, onSelect: onChange, getIdOfData: getId, noOptionsText: noOptionsText, loadingText: loadingText, lru: lruData, sortCompareFn: sortCompareFn }))));
};
export default React.memo(MultiSelectWithTags);
