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
import React, { useCallback } from "react";
import { Grid } from "@material-ui/core";
import XLSX from "xlsx";
import GenericDataPreview from "./GenericDataPreview";
import { useDialogContext } from "../../../framework";
import { FileUploadGeneric, HowToBox } from "../../../standalone";
import { showInfoDialog } from "../../../non-standalone";
import useCCTranslations from "../../../utils/useCCTranslations";
export var useImportStep1FileUploadProps = function (props) {
    var state = props.state, setState = props.setState;
    var pushDialog = useDialogContext()[0];
    var t = useCCTranslations().t;
    var handleChange = useCallback(function (files) {
        void (function () { return __awaiter(void 0, void 0, void 0, function () {
            var importableFiles, workbooks, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        importableFiles = files.filter(function (file) { return file.canBeUploaded; });
                        return [4 /*yield*/, Promise.all(importableFiles.map(function (file) {
                                return new Promise(function (resolve, reject) {
                                    var reader = new FileReader();
                                    reader.addEventListener("load", function () {
                                        try {
                                            var data = reader.result;
                                            var workbook = XLSX.read(data, {
                                                type: "array",
                                                cellDates: true,
                                            });
                                            resolve(workbook);
                                        }
                                        catch (e) {
                                            reject(e);
                                        }
                                    });
                                    reader.addEventListener("error", reject);
                                    reader.readAsArrayBuffer(file.file);
                                });
                            }))];
                    case 1:
                        workbooks = _a.sent();
                        json = workbooks
                            .map(function (book) {
                            return Object.values(book.Sheets)
                                .map(function (sheet) {
                                //remove prerendered values, otherwise dateNF is ignored
                                for (var cellref in sheet) {
                                    var c = sheet[cellref];
                                    if (c.t === "d") {
                                        delete c.w;
                                        delete c.z;
                                    }
                                }
                                return (XLSX.utils
                                    .sheet_to_json(sheet, {
                                    dateNF: 'YYYY-MM-DD"T"hh:mm:ss',
                                    raw: false,
                                    rawNumbers: true,
                                    defval: undefined,
                                    blankrows: false,
                                })
                                    // convert numbers to string, so import always works with strings
                                    .map(function (record) {
                                    return Object.fromEntries(Object.entries(record).map(function (_a) {
                                        var k = _a[0], v = _a[1];
                                        return [
                                            k,
                                            typeof v === "number" ? v.toString() : v,
                                        ];
                                    }));
                                }));
                            })
                                .flat();
                        })
                            .flat();
                        setState(function (prev) { return (__assign(__assign({}, prev), { files: files, data: json })); });
                        return [2 /*return*/];
                }
            });
        }); })();
    }, [setState]);
    var handleError = useCallback(function (_, err) {
        void showInfoDialog(pushDialog, {
            title: t("backend-components.crud.import.errors.file_select"),
            message: err,
            buttons: [
                {
                    text: t("common.buttons.ok"),
                    autoFocus: true,
                },
            ],
        });
    }, [pushDialog, t]);
    return {
        handleError: handleError,
        files: state.files,
        accept: ".xlsx",
        maxFiles: 1,
        onChange: handleChange,
    };
};
var Step1LoadData = function (props) {
    var state = props.state, howTo = props.howTo;
    var fileUploadProps = useImportStep1FileUploadProps(props);
    return (React.createElement(Grid, { container: true, direction: "column", justify: "space-between", alignItems: "stretch", wrap: "nowrap", style: { height: "100%" }, spacing: 2 },
        howTo && (React.createElement(Grid, { item: true },
            React.createElement(HowToBox, { labels: howTo }))),
        React.createElement(Grid, { item: true },
            React.createElement(FileUploadGeneric, __assign({}, fileUploadProps, { previewSize: 64 }))),
        state.data.length > 0 && !howTo && (React.createElement(Grid, { item: true, xs: true, style: { minHeight: 500 } },
            React.createElement(GenericDataPreview, { data: state.data })))));
};
export default React.memo(Step1LoadData);
