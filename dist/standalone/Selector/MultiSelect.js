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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useCallback, useMemo } from "react";
import BaseSelector from "./BaseSelector";
import { Grid, Paper } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import MultiSelectEntry from "./MultiSelectEntry";
import { cleanClassMap, combineClassMaps } from "../../utils";
var useBaseSelectorStyles = makeStyles(function (theme) { return ({
    inputRoot: function (props) { return ({
        borderRadius: props.selected.length > 0
            ? "".concat(theme.shape.borderRadius, "px ").concat(theme.shape.borderRadius, "px 0px 0px")
            : undefined,
    }); },
}); }, { name: "CcMultiSelectBase" });
var useMultiSelectorStyles = makeStyles(function (theme) { return ({
    selectedEntries: {
        border: "1px solid rgba(0, 0, 0, 0.23)",
        borderTop: 0,
        borderRadius: "0px 0px ".concat(theme.shape.borderRadius, "px ").concat(theme.shape.borderRadius, "px"),
    },
}); }, { name: "CcMultiSelect" });
var MultiSelect = function (props) {
    var _a;
    var onLoad = props.onLoad, onSelect = props.onSelect, selected = props.selected, enableIcons = props.enableIcons, selectedEntryRenderer = props.selectedEntryRenderer, disabled = props.disabled, getIdOfData = props.getIdOfData, displaySwitch = props.displaySwitch, switchLabel = props.switchLabel, defaultSwitchValue = props.defaultSwitchValue, selectedSort = props.selectedSort;
    var multiSelectClasses = useMultiSelectorStyles(props);
    var baseSelectorClasses = useBaseSelectorStyles(cleanClassMap(props, true));
    var getIdDefault = useCallback(function (data) { return data.value; }, []);
    var getId = getIdOfData !== null && getIdOfData !== void 0 ? getIdOfData : getIdDefault;
    var selectedIds = useMemo(function () { return selected.map(getId); }, [getId, selected]);
    var EntryRender = selectedEntryRenderer || MultiSelectEntry;
    var multiSelectHandler = useCallback(function (data) {
        if (!data)
            return;
        var selectedOptions = __spreadArray(__spreadArray([], selected, true), [data], false);
        if (onSelect)
            onSelect(selectedOptions);
    }, [onSelect, selected]);
    var multiSelectLoadHandler = useCallback(function (query, switchValue) { return __awaiter(void 0, void 0, void 0, function () {
        var results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, onLoad(query, switchValue)];
                case 1:
                    results = _a.sent();
                    return [2 /*return*/, results.map(function (result) {
                            return selectedIds.includes(getId(result))
                                ? __assign(__assign({}, result), { isDisabled: true, selected: true }) : result;
                        })];
            }
        });
    }); }, [getId, onLoad, selectedIds]);
    var handleDelete = useCallback(function (evt) {
        var canDelete = true;
        var entry = selected.find(function (s) { return s.value === evt.currentTarget.name; });
        if (!entry) {
            throw new Error("[Components-Care] [MultiSelect] Entry couldn't be found. Either entry.value is not set, or the entity renderer does not correctly set the name attribute");
        }
        void (function () { return __awaiter(void 0, void 0, void 0, function () {
            var selectedOptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!entry.canUnselect) return [3 /*break*/, 2];
                        return [4 /*yield*/, entry.canUnselect(entry)];
                    case 1:
                        canDelete = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (canDelete && onSelect) {
                            selectedOptions = selected.filter(function (s) { return s.value !== entry.value; });
                            onSelect(selectedOptions);
                        }
                        return [2 /*return*/];
                }
            });
        }); })();
    }, [onSelect, selected]);
    var handleSetData = useCallback(function (newValue) {
        if (!onSelect)
            return;
        onSelect(selected.map(function (entry) {
            return getId(entry) === getId(newValue) ? newValue : entry;
        }));
    }, [getId, onSelect, selected]);
    return (React.createElement(Grid, { container: true },
        React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(BaseSelector, __assign({}, props, { classes: combineClassMaps(baseSelectorClasses, (_a = props.subClasses) === null || _a === void 0 ? void 0 : _a.baseSelector), onLoad: multiSelectLoadHandler, selected: null, onSelect: multiSelectHandler, refreshToken: selectedIds.join(","), displaySwitch: displaySwitch, switchLabel: switchLabel, defaultSwitchValue: defaultSwitchValue }))),
        props.selected.length > 0 && (React.createElement(Grid, { item: true, xs: 12, className: multiSelectClasses.selectedEntries },
            React.createElement(Paper, { elevation: 0 }, (selectedSort
                ? props.selected.sort(selectedSort)
                : props.selected).map(function (data, index) { return (React.createElement(EntryRender, { key: getId(data) || index.toString(16), enableDivider: props.selected.length === index - 1, enableIcons: enableIcons, handleDelete: disabled || data.noDelete ? undefined : handleDelete, data: data, setData: handleSetData, iconSize: props.iconSize })); }))))));
};
export default React.memo(MultiSelect);
