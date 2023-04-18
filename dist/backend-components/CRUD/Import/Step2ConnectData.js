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
import React, { useCallback, useMemo, useRef } from "react";
import { isFieldImportable } from "./index";
import { Box, Card, CardContent, CircularProgress, Grid, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography, } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Check as CheckIcon, ErrorOutline as ErrorIcon, HelpOutline as UnknownIcon, } from "@mui/icons-material";
import { debouncePromise, uniqueArray } from "../../../utils";
import useCCTranslations from "../../../utils/useCCTranslations";
var useStyles = makeStyles({
    scriptInput: {
        "& textarea": {
            fontFamily: "monospace",
        },
    },
    monospace: {
        fontFamily: "monospace",
    },
    cardContent: {
        paddingBottom: 4,
        "&:last-child": {
            paddingBottom: 4,
        },
    },
}, { name: "CcCrudImportStep2" });
export var useImportStep2Logic = function (props) {
    var model = props.model, state = props.state, setState = props.setState;
    var t = useCCTranslations().t;
    var columns = useMemo(function () { return uniqueArray(state.data.map(Object.keys).flat()); }, [state.data]);
    var conversionScriptUpdates = useRef(Object.fromEntries(Object.keys(model.fields).map(function (key) { return [
        key,
        debouncePromise(function (data, field, script
        // eslint-disable-next-line @typescript-eslint/require-await
        ) { return __awaiter(void 0, void 0, void 0, function () {
            var _i, data_1, record, result, validation;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, data_1 = data;
                        _b.label = 1;
                    case 1:
                        if (!(_i < data_1.length)) return [3 /*break*/, 5];
                        record = data_1[_i];
                        result = (_a = eval(script)) !== null && _a !== void 0 ? _a : null;
                        validation = null;
                        switch (field.type.getFilterType()) {
                            case "enum":
                            case "string":
                                if (result != null && typeof result !== "string") {
                                    validation = t("backend-components.crud.import.validations.string");
                                }
                                break;
                            case "number":
                                if (result != null && typeof result !== "number") {
                                    validation = t("backend-components.crud.import.validations.number");
                                }
                                break;
                            case "currency":
                                if (result !== null)
                                    validation = t("backend-components.crud.import.validations.currency_unsupported");
                                break;
                            case "date":
                                if (result !== null && !(result instanceof Date)) {
                                    validation = t("backend-components.crud.import.validations.date");
                                }
                                break;
                            case "boolean":
                                if (result !== true && result !== false && result !== null) {
                                    validation = t("backend-components.crud.import.validations.boolean");
                                }
                                break;
                        }
                        if (!!validation) return [3 /*break*/, 3];
                        return [4 /*yield*/, field.type.validate(result)];
                    case 2:
                        // if type checks have passed, call field type validator
                        validation = _b.sent();
                        _b.label = 3;
                    case 3:
                        if (validation) {
                            // eslint-disable-next-line no-console
                            console.error("Validation failed:", validation, "; Result =", result, "; Record =", record);
                            throw new Error(t("backend-components.crud.import.validations.fail", {
                                REASON: validation,
                            }));
                        }
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        }); }, 1000),
    ]; })));
    var handleConversionScriptChange = useCallback(function (evt) { return __awaiter(void 0, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setState(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), { conversionScripts: __assign(__assign({}, prev.conversionScripts), (_a = {}, _a[evt.target.name] = {
                                script: evt.target.value,
                                status: "pending",
                                error: null,
                            }, _a)) }));
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, conversionScriptUpdates.current[evt.target.name](state.data, model.fields[evt.target.name], evt.target.value)];
                case 2:
                    _a.sent();
                    setState(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), { conversionScripts: __assign(__assign({}, prev.conversionScripts), (_a = {}, _a[evt.target.name] = __assign(__assign({}, prev.conversionScripts[evt.target.name]), { status: "okay", error: null }), _a)) }));
                    });
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    setState(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), { conversionScripts: __assign(__assign({}, prev.conversionScripts), (_a = {}, _a[evt.target.name] = __assign(__assign({}, prev.conversionScripts[evt.target.name]), { status: "error", error: e_1 }), _a)) }));
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [model.fields, setState, state.data]);
    return { columns: columns, conversionScriptUpdates: conversionScriptUpdates, handleConversionScriptChange: handleConversionScriptChange };
};
var Step2ConnectData = function (props) {
    var model = props.model, state = props.state;
    var classes = useStyles();
    var t = useCCTranslations().t;
    var _a = useImportStep2Logic(props), columns = _a.columns, handleConversionScriptChange = _a.handleConversionScriptChange;
    return (React.createElement(Grid, { container: true, spacing: 2 },
        React.createElement(Grid, { item: true, xs: 6 },
            React.createElement(Box, { mb: 2 },
                React.createElement(Typography, { variant: "h5" }, t("backend-components.crud.import.source_fields"))),
            React.createElement(Table, null,
                React.createElement(TableHead, null,
                    React.createElement(TableRow, null,
                        React.createElement(TableCell, null, t("backend-components.crud.import.source_field")),
                        React.createElement(TableCell, null, t("backend-components.crud.import.source_field_type")))),
                React.createElement(TableBody, null, columns.map(function (column) {
                    var dataTypes = uniqueArray(state.data.map(function (record) { return typeof record[column]; })).sort();
                    return (React.createElement(TableRow, { key: column },
                        React.createElement(TableCell, { className: classes.monospace }, "record[\"".concat(column, "\"]")),
                        React.createElement(TableCell, null, dataTypes.join(", "))));
                })))),
        React.createElement(Grid, { item: true, xs: 6 },
            React.createElement(Box, { mb: 2 },
                React.createElement(Typography, { variant: "h5" }, t("backend-components.crud.import.destination_fields"))),
            React.createElement(Grid, { container: true, spacing: 2 }, Object.entries(model.fields)
                .filter(function (_a) {
                var name = _a[0], field = _a[1];
                return isFieldImportable(name, field);
            })
                .map(function (_a) {
                var _b, _c, _d, _e;
                var name = _a[0], field = _a[1];
                var convScript = state.conversionScripts[name];
                return (React.createElement(Grid, { item: true, xs: 12, key: name },
                    React.createElement(Card, null,
                        React.createElement(CardContent, { className: classes.cardContent },
                            React.createElement(Grid, { container: true, justifyContent: "space-between" },
                                React.createElement(Grid, { item: true },
                                    React.createElement(Typography, null, field.getLabel()
                                        ? "".concat(field.getLabel(), " (").concat(name, ")")
                                        : name),
                                    React.createElement(Typography, { color: "textSecondary" }, field.type.getFilterType())),
                                React.createElement(Grid, { item: true },
                                    React.createElement(Tooltip, { title: convScript
                                            ? (_c = (_b = convScript.error) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : ""
                                            : (_d = t("backend-components.crud.import.validations.unknown")) !== null && _d !== void 0 ? _d : "" }, convScript ? (convScript.status === "okay" ? (React.createElement(CheckIcon, null)) : convScript.status === "pending" ? (React.createElement(CircularProgress, null)) : convScript.status === "error" ? (React.createElement(ErrorIcon, null)) : (React.createElement(UnknownIcon, null))) : (
                                    // unknown status
                                    React.createElement(UnknownIcon, null))))),
                            React.createElement(Grid, { item: true, xs: 12 },
                                React.createElement(Box, { mt: 2 },
                                    (convScript === null || convScript === void 0 ? void 0 : convScript.error) && (React.createElement(Typography, null, convScript.error.toString())),
                                    React.createElement(TextField, { multiline: true, label: t("backend-components.crud.import.conv_script"), name: name, value: (_e = convScript === null || convScript === void 0 ? void 0 : convScript.script) !== null && _e !== void 0 ? _e : "", onChange: handleConversionScriptChange, placeholder: "".concat(name, " = "), className: classes.scriptInput, fullWidth: true })))))));
            })))));
};
export default React.memo(Step2ConnectData);
