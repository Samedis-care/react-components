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
import React, { useCallback, useEffect, useState, } from "react";
import FileUpload from "../../standalone/FileUpload/Generic";
import { Loader } from "../../standalone";
var CrudFileUpload = function (props, ref) {
    var connector = props.connector, serialize = props.serialize, deserialize = props.deserialize, onChange = props.onChange, otherProps = __rest(props, ["connector", "serialize", "deserialize", "onChange"]);
    var allowDuplicates = otherProps.allowDuplicates;
    var _a = useState(true), loading = _a[0], setLoading = _a[1];
    var _b = useState(null), error = _b[0], setError = _b[1];
    var _c = useState(null), loadError = _c[0], setLoadError = _c[1];
    var _d = useState([]), files = _d[0], setFiles = _d[1];
    var handleChange = useCallback(function (newFiles) { return __awaiter(void 0, void 0, void 0, function () {
        var uploadPromise, deletePromise, uploadedFiles, finalFiles, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!connector)
                        return [2 /*return*/];
                    uploadPromise = Promise.all(newFiles
                        .filter(function (file) { return file.canBeUploaded; })
                        .map(function (file) { return __awaiter(void 0, void 0, void 0, function () {
                        var oldFile, _a, _b, _c, _d;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    if (!allowDuplicates) return [3 /*break*/, 2];
                                    oldFile = files.find(function (oldFile) { return oldFile.file.name === file.file.name; });
                                    if (!oldFile) return [3 /*break*/, 2];
                                    _b = (_a = connector).update;
                                    return [4 /*yield*/, serialize(file, oldFile.file.id)];
                                case 1: return [2 /*return*/, _b.apply(_a, [_e.sent()])];
                                case 2:
                                    _d = (_c = connector).create;
                                    return [4 /*yield*/, serialize(file, null)];
                                case 3: 
                                // or create new
                                return [2 /*return*/, _d.apply(_c, [_e.sent()])];
                            }
                        });
                    }); })
                        .map(function (request) { return __awaiter(void 0, void 0, void 0, function () { var _a; return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _a = deserialize;
                                return [4 /*yield*/, request];
                            case 1: return [2 /*return*/, _a.apply(void 0, [(_b.sent())[0]])];
                        }
                    }); }); }));
                    deletePromise = connector.deleteMultiple(newFiles
                        .filter(function (file) { return file.delete; })
                        .map(function (file) { return file.file.id; }));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    // wait for response
                    // deletePromise may be undefined or a promise
                    // eslint-disable-next-line @typescript-eslint/await-thenable
                    return [4 /*yield*/, deletePromise];
                case 2:
                    // wait for response
                    // deletePromise may be undefined or a promise
                    // eslint-disable-next-line @typescript-eslint/await-thenable
                    _a.sent();
                    return [4 /*yield*/, uploadPromise];
                case 3:
                    uploadedFiles = _a.sent();
                    finalFiles = newFiles.filter(function (file) { return !file.delete && !file.canBeUploaded; }).concat(uploadedFiles);
                    // update state
                    setFiles(finalFiles);
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    setError(e_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [allowDuplicates, connector, deserialize, files, serialize]);
    var handleError = useCallback(function (_, msg) {
        setError(new Error(msg));
    }, []);
    useEffect(function () {
        if (!connector || !loading)
            return;
        void (function () { return __awaiter(void 0, void 0, void 0, function () {
            var initialData, initialFiles, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, 4, 5]);
                        return [4 /*yield*/, connector.index({
                                page: 1,
                                rows: Number.MAX_SAFE_INTEGER,
                            })];
                    case 1:
                        initialData = _a.sent();
                        return [4 /*yield*/, Promise.all(initialData[0].map(deserialize))];
                    case 2:
                        initialFiles = _a.sent();
                        setFiles(initialFiles);
                        return [3 /*break*/, 5];
                    case 3:
                        e_2 = _a.sent();
                        setLoadError(e_2);
                        return [3 /*break*/, 5];
                    case 4:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connector]);
    useEffect(function () {
        if (onChange)
            onChange(files);
    }, [files, onChange]);
    if (loading)
        return React.createElement(Loader, null);
    if (loadError)
        return React.createElement("span", null, loadError.message);
    var ErrorComponent = props.errorComponent;
    return (React.createElement(React.Fragment, null,
        error && React.createElement(ErrorComponent, { error: error }),
        React.createElement(FileUpload, __assign({}, otherProps, { ref: ref, files: files, onChange: handleChange, handleError: handleError, readOnly: otherProps.readOnly || connector == null }))));
};
export default React.memo(React.forwardRef(CrudFileUpload));
