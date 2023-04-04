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
import React, { useEffect, useMemo } from "react";
import { isFieldImportable } from "./index";
import GenericDataPreview from "./GenericDataPreview";
import { deepAssign, dotToObject, isObjectEmpty } from "../../../utils";
import useAsyncMemo from "../../../utils/useAsyncMemo";
import useCCTranslations from "../../../utils/useCCTranslations";
import { Loader } from "../../../standalone";
export var useImportStep3Logic = function (props) {
    var model = props.model, state = props.state, setState = props.setState, validate = props.validate;
    var t = useCCTranslations().t;
    var records = useAsyncMemo(function () {
        return Promise.all(state.data.map(function (record) { return __awaiter(void 0, void 0, void 0, function () {
            var modelRecord, isModelRecordComplete, validation, _a, _b, _c, e_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        modelRecord = {};
                        isModelRecordComplete = false;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 6, , 7]);
                        Object.entries(model.fields)
                            .filter(function (_a) {
                            var _b;
                            var name = _a[0], field = _a[1];
                            return isFieldImportable(name, field) &&
                                ((_b = state.conversionScripts[name]) === null || _b === void 0 ? void 0 : _b.script);
                        })
                            .forEach(function (_a) {
                            var _b;
                            var name = _a[0];
                            deepAssign(modelRecord, dotToObject(name, 
                            // eslint-disable-next-line no-eval
                            (_b = eval(state.conversionScripts[name].script)) !== null && _b !== void 0 ? _b : null));
                        });
                        // noinspection JSUnusedAssignment
                        isModelRecordComplete = true;
                        return [4 /*yield*/, model.validate(modelRecord)];
                    case 2:
                        validation = _d.sent();
                        _a = [modelRecord];
                        if (!validate) return [3 /*break*/, 4];
                        _c = [{}];
                        return [4 /*yield*/, validate(modelRecord)];
                    case 3:
                        _b = __assign.apply(void 0, [__assign.apply(void 0, _c.concat([(_d.sent())])), validation]);
                        return [3 /*break*/, 5];
                    case 4:
                        _b = validation;
                        _d.label = 5;
                    case 5: return [2 /*return*/, _a.concat([
                            _b,
                            null
                        ])];
                    case 6:
                        e_1 = _d.sent();
                        return [2 /*return*/, [
                                isModelRecordComplete ? modelRecord : record,
                                {},
                                e_1,
                            ]];
                    case 7: return [2 /*return*/];
                }
            });
        }); }));
    }, [model, state.conversionScripts, state.data]);
    var recordsNormalized = useMemo(function () {
        return (records !== null && records !== void 0 ? records : []).map(function (record) {
            var _a;
            var data = record[0], validation = record[1], error = record[2];
            // verify that update key is unique in our import data set, otherwise we might create multiple records with the same update key
            var updateKey = props.updateKey;
            if (updateKey && !(updateKey in validation) && data[updateKey]) {
                var recordsWithUpdateKey = (records !== null && records !== void 0 ? records : []).filter(function (r) { return r[0][updateKey] === data[updateKey]; });
                if (recordsWithUpdateKey.length > 1) {
                    validation[updateKey] = t("backend-components.crud.import.errors.update-key-not-uniq", {
                        UPDATE_KEY: model.fields[updateKey].getLabel(),
                    });
                }
            }
            return __assign({ valid: isObjectEmpty(validation)
                    ? "true"
                    : Object.entries(validation)
                        .map(function (_a) {
                        var name = _a[0], error = _a[1];
                        return name + ": " + error;
                    })
                        .join("; "), error: (_a = error === null || error === void 0 ? void 0 : error.toString()) !== null && _a !== void 0 ? _a : "none" }, data);
        });
    }, [model.fields, props.updateKey, records, t]);
    var everythingOkay = useMemo(function () {
        return records
            ? !records.find(function (record) { return !isObjectEmpty(record[1]) || record[2]; })
            : false;
    }, [records]);
    useEffect(function () {
        setState(function (prev) { return (__assign(__assign({}, prev), { validationPassed: everythingOkay })); });
    }, [setState, everythingOkay]);
    return {
        records: records,
        recordsNormalized: recordsNormalized,
        everythingOkay: everythingOkay,
    };
};
var Step3ValidateReview = function (props) {
    var model = props.model;
    var _a = useImportStep3Logic(props), records = _a.records, recordsNormalized = _a.recordsNormalized, everythingOkay = _a.everythingOkay;
    var t = useCCTranslations().t;
    if (!records)
        return React.createElement(Loader, null);
    return (React.createElement(GenericDataPreview, { data: recordsNormalized, existingDefinition: __spreadArray(__spreadArray([], model.toDataGridColumnDefinition().map(function (columnDef) { return (__assign(__assign({}, columnDef), { filterable: true, sortable: true, isLocked: false, hidden: false })); }), true), [
            {
                field: "valid",
                type: "string",
                headerName: t("backend-components.crud.import.valid"),
                filterable: true,
                sortable: true,
                isLocked: false,
                hidden: false,
            },
            {
                field: "error",
                type: "string",
                headerName: t("backend-components.crud.import.error"),
                filterable: true,
                sortable: true,
                isLocked: false,
                hidden: false,
            },
        ], false), defaultFilter: everythingOkay
            ? []
            : [
                {
                    field: "valid",
                    filter: {
                        type: "notEqual",
                        value1: "true",
                        value2: "",
                    },
                },
            ] }));
};
export default React.memo(Step3ValidateReview);
