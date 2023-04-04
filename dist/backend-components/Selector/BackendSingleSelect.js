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
import { getStringLabel, SingleSelect, } from "../../standalone";
import { debouncePromise } from "../../utils";
import useCCTranslations from "../../utils/useCCTranslations";
var BackendSingleSelect = function (props) {
    var model = props.model, modelToSelectorData = props.modelToSelectorData, searchResultLimit = props.searchResultLimit, onSelect = props.onSelect, selected = props.selected, initialData = props.initialData, searchDebounceTime = props.searchDebounceTime, sort = props.sort, lru = props.lru, onLoadError = props.onLoadError, additionalOptions = props.additionalOptions, otherProps = __rest(props, ["model", "modelToSelectorData", "searchResultLimit", "onSelect", "selected", "initialData", "searchDebounceTime", "sort", "lru", "onLoadError", "additionalOptions"]);
    var _a = useState(null), selectedCache = _a[0], setSelectedCache = _a[1];
    var t = useCCTranslations().t;
    var handleLoad = useCallback(function (search) { return __awaiter(void 0, void 0, void 0, function () {
        var data, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, model.index({
                        page: 1,
                        rows: searchResultLimit !== null && searchResultLimit !== void 0 ? searchResultLimit : 25,
                        sort: sort,
                        quickFilter: search,
                    })];
                case 1:
                    data = _b.sent();
                    _a = [__spreadArray([], (additionalOptions !== null && additionalOptions !== void 0 ? additionalOptions : []).filter(function (x) {
                            return getStringLabel(x).toLowerCase().includes(search.toLowerCase());
                        }), true)];
                    return [4 /*yield*/, Promise.all(data[0].map(modelToSelectorData))];
                case 2: return [2 /*return*/, __spreadArray.apply(void 0, _a.concat([(_b.sent()), true]))];
            }
        });
    }); }, [model, searchResultLimit, sort, additionalOptions, modelToSelectorData]);
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
    var handleSelect = useCallback(function (selected) {
        setSelectedCache(selected);
        if (onSelect) {
            onSelect(selected ? selected.value : null);
        }
    }, [onSelect]);
    // fetch missing data entries
    useEffect(function () {
        if (!selected)
            return;
        if ((selectedCache === null || selectedCache === void 0 ? void 0 : selectedCache.value) === selected)
            return;
        // no need to fetch additional options
        var additionalOption = additionalOptions === null || additionalOptions === void 0 ? void 0 : additionalOptions.find(function (opt) { return opt.value === selected; });
        if (additionalOption) {
            setSelectedCache(additionalOption);
            return;
        }
        void (function () { return __awaiter(void 0, void 0, void 0, function () {
            var newCache, selectedRecord, data, e_1, err, errorMsg, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        newCache = null;
                        if (!initialData) return [3 /*break*/, 2];
                        selectedRecord = initialData.find(function (record) { return record["id"] === selected; });
                        if (!selectedRecord) return [3 /*break*/, 2];
                        return [4 /*yield*/, modelToSelectorData(selectedRecord)];
                    case 1:
                        newCache = _b.sent();
                        _b.label = 2;
                    case 2:
                        if (!!newCache) return [3 /*break*/, 7];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, model.getCached(selected)];
                    case 4:
                        data = _b.sent();
                        return [4 /*yield*/, modelToSelectorData(data[0])];
                    case 5:
                        newCache = _b.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_1 = _b.sent();
                        err = e_1;
                        errorMsg = (_a = err.message) !== null && _a !== void 0 ? _a : t("backend-components.selector.loading-error");
                        if (onLoadError) {
                            result = onLoadError(err);
                            // if we should drop the record...
                            if (!result) {
                                // unselect it
                                if (onSelect)
                                    onSelect(null);
                                newCache = null;
                                return [2 /*return*/];
                            }
                            errorMsg = result;
                        }
                        newCache = {
                            value: selected,
                            label: errorMsg,
                        };
                        return [3 /*break*/, 7];
                    case 7:
                        setSelectedCache(function (oldCache) { return Object.assign({}, oldCache, newCache); });
                        return [2 /*return*/];
                }
            });
        }); })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected]);
    var debouncedLoad = useMemo(function () { return debouncePromise(handleLoad, searchDebounceTime !== null && searchDebounceTime !== void 0 ? searchDebounceTime : 500); }, [handleLoad, searchDebounceTime]);
    return (React.createElement(SingleSelect, __assign({}, otherProps, { onLoad: debouncedLoad, onSelect: handleSelect, selected: selected
            ? selectedCache !== null && selectedCache !== void 0 ? selectedCache : {
                value: selected,
                label: t("backend-components.selector.loading"),
            }
            : null, lru: lruConfig })));
};
export default React.memo(BackendSingleSelect);
