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
import React, { useEffect, useState } from "react";
import { isFieldImportable } from "./index";
import { Grid, TextField, Typography } from "@material-ui/core";
import { Model, ModelVisibilityHidden, useModelMutation, } from "../../../backend-integration";
import { deepAssign, dotToObject, getValueByDot, sleep } from "../../../utils";
import useCCTranslations from "../../../utils/useCCTranslations";
export var useImportStep4Logic = function (props) {
    var model = props.model, state = props.state, setState = props.setState, updateKey = props.updateKey, additionalUpdateKeyFilters = props.additionalUpdateKeyFilters;
    // model which can write to all fields
    var customModel = new Model(model.modelId, Object.fromEntries(Object.entries(model.fields).map(function (_a) {
        var key = _a[0], field = _a[1];
        return [
            key,
            __assign(__assign({}, field), { visibility: __assign(__assign({}, field.visibility), { create: ModelVisibilityHidden }) }),
        ];
    })), model.connector, model.cacheKeys, model.cacheOptions);
    var createOrUpdateRecord = useModelMutation(customModel).mutateAsync;
    var _a = useState(false), importDone = _a[0], setImportDone = _a[1];
    useEffect(function () {
        setState(function (prev) { return (__assign(__assign({}, prev), { importDone: importDone })); });
    }, [setState, importDone]);
    var _b = useState({
        todo: 0,
        success: 0,
        failed: 0,
    }), counters = _b[0], setCounters = _b[1];
    var _c = useState(""), lastError = _c[0], setLastError = _c[1];
    useEffect(function () {
        void (function () { return __awaiter(void 0, void 0, void 0, function () {
            var activeRequests;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setCounters({
                            todo: state.data.length,
                            success: 0,
                            failed: 0,
                        });
                        activeRequests = 0;
                        return [4 /*yield*/, Promise.all(state.data.map(function (record) { return __awaiter(void 0, void 0, void 0, function () {
                                var modelRecord, filterKey, _a, records, meta, rows, e_1;
                                var _b;
                                var _c;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            if (!(activeRequests >= 10)) return [3 /*break*/, 2];
                                            return [4 /*yield*/, sleep(50)];
                                        case 1:
                                            _d.sent();
                                            return [3 /*break*/, 0];
                                        case 2:
                                            activeRequests++;
                                            modelRecord = {};
                                            _d.label = 3;
                                        case 3:
                                            _d.trys.push([3, 7, 8, 9]);
                                            Object.entries(model.fields)
                                                .filter(function (_a) {
                                                var name = _a[0], field = _a[1];
                                                return isFieldImportable(name, field);
                                            })
                                                .forEach(function (_a) {
                                                var _b, _c, _d;
                                                var name = _a[0];
                                                deepAssign(modelRecord, dotToObject(name, 
                                                // eslint-disable-next-line no-eval
                                                (_d = eval((_c = (_b = state.conversionScripts[name]) === null || _b === void 0 ? void 0 : _b.script) !== null && _c !== void 0 ? _c : "")) !== null && _d !== void 0 ? _d : null));
                                            });
                                            if (!updateKey) return [3 /*break*/, 5];
                                            filterKey = model.fields[updateKey].type.stringify(getValueByDot(updateKey, modelRecord));
                                            if (!filterKey) return [3 /*break*/, 5];
                                            return [4 /*yield*/, model.index({
                                                    rows: 2,
                                                    page: 1,
                                                    fieldFilter: (_b = {},
                                                        _b[updateKey] = {
                                                            type: "equals",
                                                            value1: filterKey,
                                                            value2: "",
                                                        },
                                                        _b),
                                                    additionalFilters: additionalUpdateKeyFilters,
                                                })];
                                        case 4:
                                            _a = _d.sent(), records = _a[0], meta = _a[1];
                                            rows = (_c = meta.filteredRows) !== null && _c !== void 0 ? _c : meta.totalRows;
                                            if (rows == 1) {
                                                modelRecord.id = records[0].id;
                                            }
                                            else if (rows >= 2) {
                                                throw new Error("Update key not unique: " + filterKey);
                                            }
                                            _d.label = 5;
                                        case 5: return [4 /*yield*/, createOrUpdateRecord(modelRecord)];
                                        case 6:
                                            _d.sent();
                                            setCounters(function (prev) { return (__assign(__assign({}, prev), { success: prev.success + 1 })); });
                                            return [3 /*break*/, 9];
                                        case 7:
                                            e_1 = _d.sent();
                                            // eslint-disable-next-line no-console
                                            console.error(e_1);
                                            setCounters(function (prev) { return (__assign(__assign({}, prev), { failed: prev.failed + 1 })); });
                                            // only single entry in error log for readability and performance (error spam => massive slowdown)
                                            setLastError(JSON.stringify({
                                                error: e_1.toString(),
                                                destRecord: modelRecord,
                                                sourceRecord: record,
                                            }, undefined, 4));
                                            return [3 /*break*/, 9];
                                        case 8:
                                            setCounters(function (prev) { return (__assign(__assign({}, prev), { todo: prev.todo - 1 })); });
                                            activeRequests--;
                                            return [7 /*endfinally*/];
                                        case 9: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 1:
                        _a.sent();
                        setImportDone(true);
                        return [2 /*return*/];
                }
            });
        }); })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return { counters: counters, lastError: lastError };
};
var Step4Import = function (props) {
    var _a = useImportStep4Logic(props), counters = _a.counters, lastError = _a.lastError;
    var t = useCCTranslations().t;
    return (React.createElement(Grid, { container: true, spacing: 2 },
        React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(Typography, null, t("backend-components.crud.import.queue", { COUNT: counters.todo }))),
        React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(Typography, null, t("backend-components.crud.import.success", {
                COUNT: counters.success,
            }))),
        React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(Typography, null, t("backend-components.crud.import.failed", {
                COUNT: counters.failed,
            }))),
        React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(TextField, { multiline: true, fullWidth: true, label: t("backend-components.crud.import.last_error"), value: lastError }))));
};
export default React.memo(Step4Import);
