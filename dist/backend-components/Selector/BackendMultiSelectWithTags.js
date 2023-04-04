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
import React, { useCallback, useMemo } from "react";
import { MultiSelectWithTags, } from "../../standalone";
import { useSelectedCache, } from "./BackendMultiSelect";
import { debouncePromise } from "../../utils";
/**
 * Backend connected MultiSelectWithTags
 * @remarks Doesn't support custom data
 * @constructor
 */
var BackendMultiSelectWithTags = function (props) {
    var groupModel = props.groupModel, convGroup = props.convGroup, getGroupDataEntries = props.getGroupDataEntries, dataModel = props.dataModel, convData = props.convData, switchFilterNameData = props.switchFilterNameData, switchFilterNameGroup = props.switchFilterNameGroup, initialData = props.initialData, onChange = props.onChange, groupSearchDebounceTime = props.groupSearchDebounceTime, dataSearchDebounceTime = props.dataSearchDebounceTime, selectedIds = props.selected, dataSort = props.dataSort, groupSort = props.groupSort, lruGroup = props.lruGroup, lruData = props.lruData, selectorProps = __rest(props, ["groupModel", "convGroup", "getGroupDataEntries", "dataModel", "convData", "switchFilterNameData", "switchFilterNameGroup", "initialData", "onChange", "groupSearchDebounceTime", "dataSearchDebounceTime", "selected", "dataSort", "groupSort", "lruGroup", "lruData"]);
    var _a = useSelectedCache({
        model: dataModel,
        modelToSelectorData: convData,
        initialData: initialData,
        onSelect: onChange,
        selected: selectedIds,
    }), handleSelect = _a.handleSelect, selected = _a.selected;
    var loadGroupEntries = useCallback(function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = getGroupDataEntries;
                    return [4 /*yield*/, groupModel.getCached(data.value)];
                case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
            }
        });
    }); }, [getGroupDataEntries, groupModel]);
    var loadGroupOptions = useCallback(function (query, switchValue) { return __awaiter(void 0, void 0, void 0, function () {
        var records;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, groupModel.index({
                        page: 1,
                        quickFilter: query,
                        sort: groupSort,
                        additionalFilters: switchFilterNameGroup
                            ? (_a = {}, _a[switchFilterNameGroup] = switchValue, _a) : undefined,
                    })];
                case 1:
                    records = (_b.sent())[0];
                    return [2 /*return*/, Promise.all(records.map(convGroup))];
            }
        });
    }); }, [convGroup, groupModel, groupSort, switchFilterNameGroup]);
    var loadDataOptions = useCallback(function (query, switchValue) { return __awaiter(void 0, void 0, void 0, function () {
        var records;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, dataModel.index({
                        page: 1,
                        quickFilter: query,
                        sort: dataSort,
                        additionalFilters: switchFilterNameData
                            ? (_a = {}, _a[switchFilterNameData] = switchValue, _a) : undefined,
                    })];
                case 1:
                    records = (_b.sent())[0];
                    return [2 /*return*/, Promise.all(records.map(convData))];
            }
        });
    }); }, [convData, dataModel, dataSort, switchFilterNameData]);
    var handleLoadGroupRecord = useCallback(function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, groupModel.getCached(id)];
                case 1:
                    data = (_a.sent())[0];
                    return [2 /*return*/, convGroup(data)];
            }
        });
    }); }, [groupModel, convGroup]);
    var lruGroupConfig = useMemo(function () {
        return lruGroup
            ? __assign(__assign({}, lruGroup), { loadData: handleLoadGroupRecord }) : undefined;
    }, [lruGroup, handleLoadGroupRecord]);
    var handleLoadDataRecord = useCallback(function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, dataModel.getCached(id)];
                case 1:
                    data = (_a.sent())[0];
                    return [2 /*return*/, convData(data)];
            }
        });
    }); }, [dataModel, convData]);
    var lruDataConfig = useMemo(function () {
        return lruData
            ? __assign(__assign({}, lruData), { loadData: handleLoadDataRecord }) : undefined;
    }, [lruData, handleLoadDataRecord]);
    var debouncedGroupLoad = useMemo(function () { return debouncePromise(loadGroupOptions, groupSearchDebounceTime !== null && groupSearchDebounceTime !== void 0 ? groupSearchDebounceTime : 500); }, [groupSearchDebounceTime, loadGroupOptions]);
    var debouncedDataLoad = useMemo(function () { return debouncePromise(loadDataOptions, dataSearchDebounceTime !== null && dataSearchDebounceTime !== void 0 ? dataSearchDebounceTime : 500); }, [dataSearchDebounceTime, loadDataOptions]);
    return (React.createElement(MultiSelectWithTags, __assign({}, selectorProps, { onChange: handleSelect, selected: selected, loadGroupEntries: loadGroupEntries, loadDataOptions: debouncedDataLoad, loadGroupOptions: debouncedGroupLoad, displaySwitch: !!(switchFilterNameGroup || switchFilterNameData), lruGroup: lruGroupConfig, lruData: lruDataConfig })));
};
export default React.memo(BackendMultiSelectWithTags);
