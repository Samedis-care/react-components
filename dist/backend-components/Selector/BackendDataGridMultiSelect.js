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
import React, { useCallback, useEffect, useState } from "react";
import DataGrid from "../../standalone/DataGrid/DataGrid";
import Connector from "../../backend-integration/Connector/Connector";
import { renderDataGridRecordUsingModel } from "../DataGrid";
import { DataGridNoPersist } from "../../standalone";
var BackendDataGridMultiSelect = function (props) {
    var model = props.model, readOnly = props.readOnly, selected = props.selected, onChange = props.onChange, gridProps = __rest(props, ["model", "readOnly", "selected", "onChange"]);
    var _a = useState(new Date().toISOString()), refreshToken = _a[0], setRefreshToken = _a[1];
    var refreshGrid = useCallback(function () { return setRefreshToken(new Date().toISOString()); }, []);
    var _b = useState(false), initialSelectionChangeReceived = _b[0], setInitialSelectionChangeReceived = _b[1];
    // developer warning
    useEffect(function () {
        if (process.env.NODE_ENV === "development" &&
            model.connector.index2 === Connector.prototype.index2) {
            // eslint-disable-next-line no-console
            console.warn("[Components-Care] [DataGridMultiSelectCRUD] Backend connector does not support index2 function, offset based pagination will be emulated (inefficient)");
        }
    }, [model]);
    // handle force refresh token
    useEffect(refreshGrid, [refreshGrid, gridProps.forceRefreshToken]);
    return (React.createElement(DataGridNoPersist, null,
        React.createElement(DataGrid, __assign({}, gridProps, { columns: model.toDataGridColumnDefinition(), forceRefreshToken: refreshToken, disableSelection: false, prohibitMultiSelect: false, customSelectionControl: undefined, onSelectionChange: function (invert, newIds) {
                if (!initialSelectionChangeReceived) {
                    setInitialSelectionChangeReceived(true);
                    return;
                }
                onChange(readOnly ? __spreadArray([], selected, true) : newIds);
            }, selection: [false, selected], loadData: function (params) { return __awaiter(void 0, void 0, void 0, function () {
                var _a, relationshipRecordsFiltered, relationshipRecordFilteredMeta, _b, relationshipRecordFilteredCount, requestedOffset, _c, dataRecords, dataMeta;
                var _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            if (!(selected.length > 0)) return [3 /*break*/, 2];
                            return [4 /*yield*/, model.index(__assign(__assign({}, params), { fieldFilter: __assign(__assign({}, params.fieldFilter), { id: {
                                            type: "inSet",
                                            value1: selected.join(","),
                                            value2: "",
                                        } }) }))];
                        case 1:
                            _b = _e.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            _b = [[], { totalRows: 0 }];
                            _e.label = 3;
                        case 3:
                            _a = _b, relationshipRecordsFiltered = _a[0], relationshipRecordFilteredMeta = _a[1];
                            relationshipRecordFilteredCount = (_d = relationshipRecordFilteredMeta.filteredRows) !== null && _d !== void 0 ? _d : relationshipRecordFilteredMeta.totalRows;
                            requestedOffset = (params.page - 1) * params.rows - relationshipRecordFilteredCount;
                            return [4 /*yield*/, model.index2(__assign(__assign({}, params), { fieldFilter: __assign(__assign({}, params.fieldFilter), { id: {
                                            type: "notInSet",
                                            value1: selected.join(","),
                                            value2: "",
                                        } }), offset: Math.max(requestedOffset, 0), rows: Math.max(requestedOffset + params.rows, 0) }))];
                        case 4:
                            _c = _e.sent(), dataRecords = _c[0], dataMeta = _c[1];
                            return [2 /*return*/, {
                                    rowsTotal: (dataMeta.filteredRows != null
                                        ? selected.length
                                        : relationshipRecordFilteredCount) + dataMeta.totalRows,
                                    rowsFiltered: dataMeta.filteredRows != null
                                        ? relationshipRecordFilteredCount + dataMeta.totalRows
                                        : undefined,
                                    rows: relationshipRecordsFiltered
                                        .concat(dataRecords)
                                        .map(renderDataGridRecordUsingModel(model, refreshGrid)),
                                }];
                    }
                });
            }); } }))));
};
export default React.memo(BackendDataGridMultiSelect);
