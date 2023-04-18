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
import { useCallback, useContext, useEffect, useImperativeHandle, useRef, useState, } from "react";
import { shallowCompare } from "../../utils";
import { FormContext } from "../Form";
var useCrudSelect = function (params, ref) {
    var connector = params.connector, serialize = params.serialize, deserialize = params.deserialize, deserializeModel = params.deserializeModel, onChange = params.onChange, initialSelected = params.initialSelected, validate = params.validate, field = params.field, getIdOfData = params.getIdOfData;
    var _a = useState(true), loading = _a[0], setLoading = _a[1];
    var _b = useState(null), error = _b[0], setError = _b[1];
    var _c = useState(null), loadError = _c[0], setLoadError = _c[1];
    var _d = useState([]), selected = _d[0], setSelected = _d[1];
    var _e = useState([]), initialRawData = _e[0], setInitialRawData = _e[1];
    // async processing of add to selection
    var addToSelectionResults = useRef({});
    var addToSelectionInputs = useRef({});
    var _f = useState([]), addToSelectionQueue = _f[0], setAddToSelectionQueue = _f[1];
    useImperativeHandle(ref, function () { return ({
        addToSelection: function (entry) { return __awaiter(void 0, void 0, void 0, function () {
            var ticket, result;
            return __generator(this, function (_a) {
                ticket = Math.random().toString() + new Date().getTime().toString();
                result = new Promise(function (resolve, reject) {
                    addToSelectionResults.current[ticket] = [resolve, reject];
                });
                addToSelectionInputs.current[ticket] = entry;
                setAddToSelectionQueue(function (prev) { return __spreadArray(__spreadArray([], prev, true), [ticket], false); });
                return [2 /*return*/, result];
            });
        }); },
    }); });
    // async processing of add to selection
    useEffect(function () {
        if (loading)
            return;
        if (addToSelectionQueue.length === 0)
            return;
        var ticket = addToSelectionQueue[0];
        var entry = addToSelectionInputs.current[ticket];
        if (entry === undefined)
            return; // if entry is undefined here we already started working on this, thus just wait
        delete addToSelectionInputs.current[ticket];
        var _a = addToSelectionResults.current[ticket], resolve = _a[0], reject = _a[1];
        delete addToSelectionResults.current[ticket];
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var existing, modelRecord, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (loadError)
                            throw new Error("CrudSelect loading failed");
                        existing = selected.find(function (selEntry) { return getIdOfData(selEntry) === getIdOfData(entry); });
                        if (existing)
                            return [2 /*return*/];
                        _b = (_a = connector).create;
                        return [4 /*yield*/, serialize(entry)];
                    case 1: return [4 /*yield*/, _b.apply(_a, [_d.sent()])];
                    case 2:
                        modelRecord = (_d.sent())[0];
                        _c = [{}];
                        return [4 /*yield*/, deserialize(modelRecord)];
                    case 3:
                        entry = __assign.apply(void 0, _c.concat([(_d.sent())]));
                        // store record in cache
                        setInitialRawData(function (oldRawData) { return __spreadArray(__spreadArray([], oldRawData, true), [modelRecord], false); });
                        setSelected(function (selected) {
                            var existing = selected.find(function (selEntry) { return getIdOfData(selEntry) === getIdOfData(entry); });
                            if (existing)
                                return selected;
                            return __spreadArray(__spreadArray([], selected, true), [entry], false);
                        });
                        return [2 /*return*/];
                }
            });
        }); })()
            .then(resolve)
            .catch(reject)
            .finally(function () {
            return setAddToSelectionQueue(function (prev) {
                return prev.filter(function (queueTicket) { return queueTicket !== ticket; });
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, addToSelectionQueue]);
    var handleSelect = useCallback(function (_, newSelected) { return __awaiter(void 0, void 0, void 0, function () {
        var newEntries, changedEntries, deletedEntries, createPromise, updatePromise, deletePromise, created_1, finalSelected, _a, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    newEntries = newSelected.filter(function (entry) { return !selected.find(function (selEntry) { return selEntry.value === entry.value; }); });
                    // remove new entries from array
                    newSelected = newSelected.filter(function (entry) {
                        return selected.find(function (selEntry) { return selEntry.value === entry.value; });
                    });
                    changedEntries = newSelected.filter(function (entry) {
                        var oldEntry = selected.find(function (selEntry) { return selEntry.value === entry.value; });
                        if (!oldEntry)
                            return false;
                        // remove all base selector data and multi selector data render options
                        // this way we only update when the data actually changed
                        var normalize = function (record) {
                            return Object.assign({}, record, {
                                label: null,
                                icon: null,
                                onClick: null,
                                canUnselect: null,
                                noDelete: null,
                                isDisabled: null,
                                selected: null,
                                hidden: null,
                                ignore: null,
                                group: null,
                                isAddNewButton: null,
                                isDivider: null,
                                isSmallLabel: null,
                                className: null,
                            });
                        };
                        return !shallowCompare(normalize(entry), normalize(oldEntry));
                    });
                    deletedEntries = selected.filter(function (entry) {
                        return !newSelected.find(function (selEntry) { return selEntry.value === entry.value; });
                    });
                    createPromise = Promise.all(newEntries
                        .map(function (entry) { return serialize(entry); })
                        .map(function (serializedEntry) { return __awaiter(void 0, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _b = (_a = connector).create;
                                return [4 /*yield*/, serializedEntry];
                            case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                        }
                    }); }); }));
                    updatePromise = Promise.all(changedEntries
                        .map(function (entry) { return serialize(entry); })
                        .map(function (serializedEntry) { return __awaiter(void 0, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _b = (_a = connector).update;
                                return [4 /*yield*/, serializedEntry];
                            case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                        }
                    }); }); }));
                    deletePromise = Promise.all(deletedEntries
                        .map(function (entry) { return serialize(entry); })
                        .map(function (serializedEntry) { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _b = (_a = connector).delete;
                                    return [4 /*yield*/, serializedEntry];
                                case 1: return [2 /*return*/, _b.apply(_a, [(_c.sent()).id])];
                            }
                        });
                    }); }));
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, createPromise];
                case 2:
                    created_1 = (_b.sent()).map(function (e) { return e[0]; });
                    return [4 /*yield*/, updatePromise];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, deletePromise];
                case 4:
                    _b.sent();
                    _a = [__spreadArray([], newSelected, true)];
                    return [4 /*yield*/, Promise.all(created_1.map(function (entry) { return deserialize(entry); }))];
                case 5:
                    finalSelected = __spreadArray.apply(void 0, _a.concat([(_b.sent()), true]));
                    // reflect changes
                    setInitialRawData(function (oldRawData) { return __spreadArray(__spreadArray([], oldRawData, true), created_1, true); });
                    setSelected(finalSelected);
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _b.sent();
                    setError(e_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); }, [connector, deserialize, selected, serialize]);
    var modelToSelectorData = useCallback(function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!initialRawData.includes(data)) return [3 /*break*/, 1];
                    _a = deserialize(data);
                    return [3 /*break*/, 3];
                case 1:
                    _b = [{}];
                    return [4 /*yield*/, deserializeModel(data)];
                case 2:
                    _a = __assign.apply(void 0, [__assign.apply(void 0, _b.concat([(_c.sent())])), { value: "to-create-" + Math.random().toString() }]);
                    _c.label = 3;
                case 3: return [2 /*return*/, _a];
            }
        });
    }); }, [deserialize, deserializeModel, initialRawData]);
    // initial load
    useEffect(function () {
        void (function () { return __awaiter(void 0, void 0, void 0, function () {
            var currentlySelected, initialSelected_1, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setLoading(true);
                        if (!initialSelected) return [3 /*break*/, 2];
                        return [4 /*yield*/, handleSelect(undefined, initialSelected)];
                    case 1:
                        _a.sent();
                        setLoading(false);
                        return [2 /*return*/];
                    case 2:
                        _a.trys.push([2, 5, 6, 7]);
                        return [4 /*yield*/, connector.index({
                                page: 1,
                                rows: Number.MAX_SAFE_INTEGER,
                            })];
                    case 3:
                        currentlySelected = _a.sent();
                        return [4 /*yield*/, Promise.all(currentlySelected[0].map(function (record) { return deserialize(record); }))];
                    case 4:
                        initialSelected_1 = _a.sent();
                        setInitialRawData(currentlySelected[0]);
                        setSelected(initialSelected_1);
                        return [3 /*break*/, 7];
                    case 5:
                        e_2 = _a.sent();
                        setLoadError(e_2);
                        return [3 /*break*/, 7];
                    case 6:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // on change event
    useEffect(function () {
        if (onChange)
            onChange(selected);
    }, [onChange, selected]);
    // validations
    var formCtx = useContext(FormContext);
    useEffect(function () {
        if (!formCtx || !validate || !field) {
            if (validate && process.env.NODE_ENV === "development") {
                var reasons = [];
                if (!formCtx)
                    reasons.push("Form context not present, validate only works inside of Components-Care Form Engine");
                if (!field)
                    reasons.push("Field prop not passed. This is required to register the validation handler with the Form Engine. This value has to be unique to the form");
                // eslint-disable-next-line no-console
                console.error("[Components-Care] [useCrudSelect] Crud Select has been given validate function, but can't be activated due to the following reasons", reasons);
            }
            return;
        }
        var setCustomValidationHandler = formCtx.setCustomValidationHandler, removeCustomValidationHandler = formCtx.removeCustomValidationHandler, onlyValidateMounted = formCtx.onlyValidateMounted;
        setCustomValidationHandler(field, function () { return validate(selected); });
        return function () {
            if (onlyValidateMounted)
                removeCustomValidationHandler(field);
        };
    });
    return {
        loading: loading,
        error: error,
        loadError: loadError,
        selected: selected,
        initialRawData: initialRawData,
        handleSelect: handleSelect,
        modelToSelectorData: modelToSelectorData,
    };
};
export default useCrudSelect;
