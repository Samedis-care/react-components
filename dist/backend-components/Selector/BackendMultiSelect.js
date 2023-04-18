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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MultiSelect, } from "../../standalone";
import { debouncePromise } from "../../utils";
import useCCTranslations from "../../utils/useCCTranslations";
export var useSelectedCache = function (props) {
    var model = props.model, modelToSelectorData = props.modelToSelectorData, onSelect = props.onSelect, selected = props.selected, initialData = props.initialData, onLoadError = props.onLoadError;
    var _a = useState({}), selectedCache = _a[0], setSelectedCache = _a[1];
    var t = useCCTranslations().t;
    var handleSelect = useCallback(function (selected) {
        setSelectedCache(function (cache) {
            var newCache = __assign({}, cache);
            selected.forEach(function (entry) { return (newCache[entry.value] = entry); });
            return newCache;
        });
        if (onSelect) {
            onSelect(selected.map(function (entry) { return entry.value; }), selected);
        }
    }, [onSelect]);
    // fetch missing data entries
    useEffect(function () {
        void (function () { return __awaiter(void 0, void 0, void 0, function () {
            var newCache, isIdNotInCache, newSelection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newCache = {};
                        if (!initialData) return [3 /*break*/, 2];
                        // process initial data
                        return [4 /*yield*/, Promise.all(initialData
                                .filter(function (record) {
                                return !(record.id in selectedCache);
                            })
                                .map(function (record) { return __awaiter(void 0, void 0, void 0, function () {
                                var _a, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            _a = newCache;
                                            _b = record.id;
                                            return [4 /*yield*/, modelToSelectorData(record)];
                                        case 1: return [2 /*return*/, (_a[_b] = _c.sent())];
                                    }
                                });
                            }); }))];
                    case 1:
                        // process initial data
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        isIdNotInCache = function (value) {
                            return !(value in selectedCache) && !(value in newCache);
                        };
                        return [4 /*yield*/, Promise.all(selected.filter(isIdNotInCache).map(function (value) { return __awaiter(void 0, void 0, void 0, function () {
                                var data, _a, _b, e_1, err, errorMsg, result;
                                var _c;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            _d.trys.push([0, 3, , 4]);
                                            return [4 /*yield*/, model.getCached(value)];
                                        case 1:
                                            data = _d.sent();
                                            _a = newCache;
                                            _b = value;
                                            return [4 /*yield*/, modelToSelectorData(data[0])];
                                        case 2:
                                            _a[_b] = _d.sent();
                                            return [3 /*break*/, 4];
                                        case 3:
                                            e_1 = _d.sent();
                                            err = e_1;
                                            errorMsg = (_c = err.message) !== null && _c !== void 0 ? _c : t("backend-components.selector.loading-error");
                                            if (onLoadError) {
                                                result = onLoadError(err);
                                                // if we should drop the record return here and don't create a record in cache
                                                if (!result) {
                                                    return [2 /*return*/];
                                                }
                                                errorMsg = result;
                                            }
                                            newCache[value] = {
                                                value: value,
                                                label: errorMsg,
                                            };
                                            return [3 /*break*/, 4];
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 3:
                        _a.sent();
                        // now that everything has loaded ensure we actually drop records
                        // if we can update and we have something to drop
                        if (onSelect && selected.filter(isIdNotInCache).length > 0) {
                            newSelection = selected.filter(function (id) { return !isIdNotInCache(id); });
                            onSelect(newSelection, newSelection.map(function (id) { var _a; return (_a = selectedCache[id]) !== null && _a !== void 0 ? _a : newCache[id]; }));
                        }
                        setSelectedCache(function (oldCache) { return Object.assign({}, oldCache, newCache); });
                        return [2 /*return*/];
                }
            });
        }); })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected]);
    return {
        selected: selected.map(function (value) {
            var _a;
            return (_a = selectedCache[value]) !== null && _a !== void 0 ? _a : {
                value: value,
                label: t("backend-components.selector.loading"),
            };
        }),
        handleSelect: handleSelect,
    };
};
/**
 * Backend connected MultiSelect
 * @remarks Doesn't support custom data
 * @constructor
 */
var BackendMultiSelect = function (props) {
    var model = props.model, modelToSelectorData = props.modelToSelectorData, searchResultLimit = props.searchResultLimit, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSelect = props.onSelect, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectedIds = props.selected, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    initialData = props.initialData, searchDebounceTime = props.searchDebounceTime, sort = props.sort, switchFilterName = props.switchFilterName, lru = props.lru, otherProps = __rest(props, ["model", "modelToSelectorData", "searchResultLimit", "onSelect", "selected", "initialData", "searchDebounceTime", "sort", "switchFilterName", "lru"]);
    var _a = useSelectedCache(props), selected = _a.selected, handleSelect = _a.handleSelect;
    var handleLoad = useCallback(function (search, switchValue) { return __awaiter(void 0, void 0, void 0, function () {
        var data;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, model.index({
                        page: 1,
                        rows: searchResultLimit !== null && searchResultLimit !== void 0 ? searchResultLimit : 25,
                        quickFilter: search,
                        sort: sort,
                        additionalFilters: switchFilterName
                            ? (_a = {}, _a[switchFilterName] = switchValue, _a) : undefined,
                    })];
                case 1:
                    data = _b.sent();
                    return [2 /*return*/, Promise.all(data[0].map(modelToSelectorData))];
            }
        });
    }); }, [model, modelToSelectorData, searchResultLimit, sort, switchFilterName]);
    var handleLoadRecord = useCallback(function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, model.getCached(id)];
                case 1:
                    data = (_a.sent())[0];
                    return [2 /*return*/, modelToSelectorData(data)];
            }
        });
    }); }, [model, modelToSelectorData]);
    var lruConfig = useMemo(function () {
        return lru
            ? __assign(__assign({}, lru), { loadData: handleLoadRecord }) : undefined;
    }, [lru, handleLoadRecord]);
    var debouncedLoad = useMemo(function () { return debouncePromise(handleLoad, searchDebounceTime !== null && searchDebounceTime !== void 0 ? searchDebounceTime : 500); }, [searchDebounceTime, handleLoad]);
    return (React.createElement(MultiSelect, __assign({}, otherProps, { onLoad: debouncedLoad, onSelect: handleSelect, selected: selected, displaySwitch: !!switchFilterName, lru: lruConfig })));
};
export default React.memo(BackendMultiSelect);
