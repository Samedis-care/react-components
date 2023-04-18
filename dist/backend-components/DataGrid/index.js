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
import React, { useCallback, useMemo, useState } from "react";
import DataGrid from "../../standalone/DataGrid/DataGrid";
import { useModelDeleteAdvanced, useModelDeleteMultiple, } from "../../backend-integration/Model/Model";
import { useDialogContext } from "../../framework";
import { ErrorDialog, showConfirmDialog } from "../../non-standalone";
import useCCTranslations from "../../utils/useCCTranslations";
import { dotToObject, getValueByDot } from "../../utils";
export var renderDataGridRecordUsingModel = function (model, refreshGrid) { return function (entry) {
    return Object.fromEntries(Object.keys(model.fields)
        .map(function (key) {
        // we cannot render the ID, this will cause issues with the selection
        var value = getValueByDot(key, entry);
        if (key === "id") {
            return [
                [key, value],
                [key + "_raw", value],
            ];
        }
        var field = model.fields[key];
        var id = entry.id;
        // no need to render disabled fields
        if (field.visibility.overview.disabled) {
            return [
                [key, value],
                [key + "_raw", value],
            ];
        }
        return [
            [
                key,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                field
                    ? field.type.render({
                        field: key,
                        value: value,
                        touched: false,
                        initialValue: value,
                        label: field.getLabel(),
                        visibility: Object.assign({}, field.visibility.overview, {
                            hidden: false,
                        }),
                        /**
                         * The onChange handler for editable input fields
                         */
                        handleChange: function (field, value) {
                            if (!id)
                                throw new Error("ID not set!");
                            void (function () { return __awaiter(void 0, void 0, void 0, function () {
                                var _a, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            _b = (_a = model.connector).update;
                                            return [4 /*yield*/, model.applySerialization(__assign({ id: id }, dotToObject(field, value)), "serialize", "overview")];
                                        case 1: return [4 /*yield*/, _b.apply(_a, [_c.sent()])];
                                        case 2:
                                            _c.sent();
                                            refreshGrid();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })();
                        },
                        handleBlur: function () {
                            // this is unhandled in the data grid
                        },
                        errorMsg: null,
                        warningMsg: null,
                        setError: function () {
                            throw new Error("Not implemented in Grid");
                        },
                        setFieldTouched: function () {
                            throw new Error("Not implemented in Grid");
                        },
                        values: entry,
                    })
                    : null,
            ],
            [key + "_raw", value],
        ];
    })
        .flat());
}; };
var BackendDataGrid = function (props) {
    var model = props.model, enableDelete = props.enableDelete, enableDeleteAll = props.enableDeleteAll, customDeleteConfirm = props.customDeleteConfirm;
    var t = useCCTranslations().t;
    var pushDialog = useDialogContext()[0];
    var _a = useState(""), refreshToken = _a[0], setRefreshToken = _a[1];
    if (enableDeleteAll && !model.doesSupportAdvancedDeletion()) {
        throw new Error("Delete All functionality requested, but not provided by model backend connector");
    }
    var refreshGrid = useCallback(function () { return setRefreshToken(new Date().getTime().toString()); }, []);
    var loadData = useCallback(function (params) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, result, meta;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, model.index(params)];
                case 1:
                    _a = _b.sent(), result = _a[0], meta = _a[1];
                    // eslint-disable-next-line no-debugger
                    return [2 /*return*/, {
                            rowsTotal: meta.totalRows,
                            rowsFiltered: meta.filteredRows,
                            rows: result.map(renderDataGridRecordUsingModel(model, refreshGrid)),
                        }];
            }
        });
    }); }, [model, refreshGrid]);
    var deleteAdvanced = useModelDeleteAdvanced(model).mutateAsync;
    var deleteMultiple = useModelDeleteMultiple(model).mutateAsync;
    var handleDelete = useCallback(function (invert, ids, filter) { return __awaiter(void 0, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!customDeleteConfirm) return [3 /*break*/, 2];
                    return [4 /*yield*/, customDeleteConfirm(invert, ids, filter)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, showConfirmDialog(pushDialog, {
                        title: t("backend-components.data-grid.delete.confirm-dialog.title"),
                        message: t("backend-components.data-grid.delete.confirm-dialog." +
                            (invert ? "messageInverted" : "message"), { NUM: ids.length }),
                        textButtonYes: t("backend-components.data-grid.delete.confirm-dialog.buttons.yes"),
                        textButtonNo: t("backend-components.data-grid.delete.confirm-dialog.buttons.no"),
                    })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 9, , 10]);
                    if (!enableDeleteAll) return [3 /*break*/, 6];
                    return [4 /*yield*/, deleteAdvanced([invert, ids, filter])];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, deleteMultiple(ids)];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8:
                    refreshGrid();
                    return [3 /*break*/, 10];
                case 9:
                    e_1 = _a.sent();
                    refreshGrid();
                    pushDialog(React.createElement(ErrorDialog, { title: t("backend-components.data-grid.delete.error-dialog.title"), message: t("backend-components.data-grid.delete.error-dialog.message", { ERROR: e_1.message }), buttons: [
                            {
                                text: t("backend-components.data-grid.delete.error-dialog.buttons.okay"),
                            },
                        ] }));
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    }); }, [
        customDeleteConfirm,
        pushDialog,
        t,
        enableDeleteAll,
        refreshGrid,
        deleteAdvanced,
        deleteMultiple,
    ]);
    var addNewButtons = useMemo(function () {
        var _a, _b;
        if (!props.additionalNewButtons)
            return props.onAddNew;
        if (!props.onAddNew)
            return props.additionalNewButtons;
        var result;
        if (typeof props.onAddNew === "function") {
            result = [
                {
                    label: (_a = t("standalone.data-grid.header.new")) !== null && _a !== void 0 ? _a : "",
                    onClick: props.onAddNew,
                },
            ];
        }
        else if (typeof props.onAddNew === "string") {
            result = [
                {
                    label: (_b = t("standalone.data-grid.header.new")) !== null && _b !== void 0 ? _b : "",
                    onClick: undefined,
                    disableHint: props.onAddNew,
                },
            ];
        }
        else if (Array.isArray(props.onAddNew)) {
            result = props.onAddNew;
        }
        else {
            result = [];
        }
        result = result.concat(props.additionalNewButtons);
        return result;
    }, [props.additionalNewButtons, props.onAddNew, t]);
    return (React.createElement(DataGrid, __assign({}, props, { onAddNew: addNewButtons, onDelete: enableDelete ? handleDelete : undefined, loadData: loadData, columns: model.toDataGridColumnDefinition(), forceRefreshToken: "".concat(props.forceRefreshToken || "undefined").concat(refreshToken), exporters: props.disableExport ? undefined : model.connector.dataGridExporters })));
};
export default React.memo(BackendDataGrid);
