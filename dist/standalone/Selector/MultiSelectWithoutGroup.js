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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Search as SearchIcon, Cancel as RemoveIcon, } from "@mui/icons-material";
import BaseSelector from "./BaseSelector";
import { SmallIconButton, SmallListItemIcon } from "../Small";
import InlineSwitch from "../InlineSwitch";
import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
var useStyles = makeStyles({
    outlined: {
        float: "left",
        backgroundColor: "#cce1f6",
        padding: "0px 20px",
        borderRadius: 20,
        borderColor: "#cce1f6",
        margin: "5px",
        lineHeight: "30px",
    },
    searchLabel: {
        lineHeight: "30px",
        float: "left",
    },
    switch: {
        lineHeight: "30px",
        width: "100%",
        direction: "rtl",
    },
    labelWithSwitch: {
        marginTop: 0,
    },
}, { name: "CcMultiSelectWithoutGroup" });
var MultiSelectWithoutGroup = function (props) {
    var onSelect = props.onSelect, selected = props.selected, disabled = props.disabled, enableIcons = props.enableIcons, loadDataOptions = props.loadDataOptions, getIdOfData = props.getIdOfData, refreshToken = props.refreshToken, switchValue = props.switchValue, sortCompareFn = props.sortCompareFn, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    classProps = props.classes, otherProps = __rest(props, ["onSelect", "selected", "disabled", "enableIcons", "loadDataOptions", "getIdOfData", "refreshToken", "switchValue", "sortCompareFn", "classes"]);
    var classes = useStyles(props);
    var _a = useState([]), dataOptions = _a[0], setDataOptions = _a[1];
    var getIdDefault = useCallback(function (data) { return data.value; }, []);
    var getId = getIdOfData !== null && getIdOfData !== void 0 ? getIdOfData : getIdDefault;
    var selectedIds = useMemo(function () { return selected.map(getId); }, [selected, getId]);
    useEffect(function () {
        selected.map(function (selectedOption) {
            setDataOptions(function (oldOptions) {
                return oldOptions.filter(function (option) { return !getId(option).includes(getId(selectedOption)); });
            });
        });
    }, [getId, selected]);
    var handleDelete = useCallback(function (evt) { return __awaiter(void 0, void 0, void 0, function () {
        var entryToDelete, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!onSelect)
                        return [2 /*return*/];
                    entryToDelete = selected.find(function (s) { return s.value === evt.currentTarget.name; });
                    if (!entryToDelete) {
                        throw new Error("[Components-Care] [MultiSelectWithoutGroups] Entry couldn't be found. entry.value is not set");
                    }
                    _a = entryToDelete.canUnselect;
                    if (!_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, entryToDelete.canUnselect(entryToDelete)];
                case 1:
                    _a = !(_b.sent());
                    _b.label = 2;
                case 2:
                    // check that we can delete the item
                    if (_a) {
                        return [2 /*return*/];
                    }
                    setDataOptions(__spreadArray(__spreadArray([], dataOptions, true), [entryToDelete], false));
                    onSelect(selected.filter(function (entry) { return entry !== entryToDelete; }));
                    return [2 /*return*/];
            }
        });
    }); }, [onSelect, setDataOptions, dataOptions, selected]);
    var multiSelectHandler = useCallback(function (data) {
        if (!data)
            return;
        var selectedOptions = __spreadArray(__spreadArray([], selected, true), [data], false);
        if (onSelect)
            onSelect(selectedOptions);
    }, [onSelect, selected]);
    var onLoad = useCallback(function (query) { return __awaiter(void 0, void 0, void 0, function () {
        var results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadDataOptions(query, !!switchValue)];
                case 1:
                    results = _a.sent();
                    return [2 /*return*/, results.map(function (result) {
                            return selectedIds.includes(getId(result))
                                ? __assign(__assign({}, result), { isDisabled: true, selected: true }) : result;
                        })];
            }
        });
    }); }, [getId, loadDataOptions, selectedIds, switchValue]);
    return (React.createElement(Typography, { component: "div" },
        React.createElement(BaseSelector, __assign({}, otherProps, { onLoad: onLoad, selected: null, onSelect: multiSelectHandler, refreshToken: (refreshToken !== null && refreshToken !== void 0 ? refreshToken : "") +
                selectedIds.join(",") +
                (switchValue !== null && switchValue !== void 0 ? switchValue : false).toString(), variant: "standard", startAdornment: React.createElement(SearchIcon, { color: "primary" }), freeSolo: true, displaySwitch: false, filterIds: selected.map(getId) })),
        React.createElement(InlineSwitch, { visible: !!props.displaySwitch, value: !!switchValue, onChange: props.setSwitchValue, label: props.switchLabel, classes: classes },
            React.createElement(React.Fragment, null, (sortCompareFn ? selected.sort(sortCompareFn) : selected).map(function (data, index) {
                return (React.createElement("div", { key: index, className: classes.outlined },
                    enableIcons && (React.createElement(SmallListItemIcon, null, data.icon)),
                    React.createElement("span", null, data.label),
                    !disabled && (React.createElement(SmallIconButton, { edge: "end", name: data.value, disabled: disabled, onClick: handleDelete },
                        React.createElement(RemoveIcon, null)))));
            })))));
};
export default React.memo(MultiSelectWithoutGroup);
