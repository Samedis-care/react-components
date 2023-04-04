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
import React, { useCallback, useEffect, useState } from "react";
import { MultiImageNewIdPrefix, } from "../../standalone/FileUpload/MultiImage/MultiImage";
import { Loader, MultiImage } from "../../standalone";
var CrudMultiImage = function (props) {
    var connector = props.connector, ErrorComponent = props.errorComponent, serialize = props.serialize, deserialize = props.deserialize, onChange = props.onChange, additionalImages = props.additionalImages, additionalImagesLoading = props.additionalImagesLoading, otherProps = __rest(props, ["connector", "errorComponent", "serialize", "deserialize", "onChange", "additionalImages", "additionalImagesLoading"]);
    var name = otherProps.name, primary = otherProps.primary, onPrimaryChange = otherProps.onPrimaryChange;
    var _a = useState(true), loading = _a[0], setLoading = _a[1];
    var _b = useState(null), error = _b[0], setError = _b[1];
    var _c = useState(null), loadError = _c[0], setLoadError = _c[1];
    var _d = useState([]), images = _d[0], setImages = _d[1];
    var handleChange = useCallback(function (_, newImages) { return __awaiter(void 0, void 0, void 0, function () {
        var uploadPromise, deletePromise, uploadedImages, finalImages_1, e_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (additionalImages)
                        newImages = newImages.filter(function (img) { return !additionalImages.includes(img); });
                    newImages = newImages.map(function (img, n) { return (__assign(__assign({}, img), { index: n, primary: primary === img.id })); });
                    uploadPromise = Promise.all(newImages
                        .filter(function (img) {
                        return img.id.startsWith(MultiImageNewIdPrefix) || !images.includes(img);
                    })
                        .map(function (img) { return __awaiter(void 0, void 0, void 0, function () {
                        var oldImg, _a, _b, _c, _d;
                        var _e, _f, _g;
                        return __generator(this, function (_h) {
                            switch (_h.label) {
                                case 0:
                                    oldImg = !img.id.startsWith(MultiImageNewIdPrefix) &&
                                        images.find(function (oldImg) { return oldImg.id === img.id; });
                                    if (!oldImg) return [3 /*break*/, 5];
                                    if (!(oldImg.image === img.image && oldImg.name === img.name)) return [3 /*break*/, 2];
                                    _e = {};
                                    return [4 /*yield*/, serialize(img, oldImg.id)];
                                case 1: 
                                // no changes to image or file name, so we don't cause a PUT here
                                return [2 /*return*/, (_e.response = [_h.sent()],
                                        _e.index = img.index,
                                        _e.primary = img.primary,
                                        _e)];
                                case 2:
                                    _f = {};
                                    _b = (_a = connector).update;
                                    return [4 /*yield*/, serialize(img, oldImg.id)];
                                case 3: return [4 /*yield*/, _b.apply(_a, [_h.sent()])];
                                case 4: return [2 /*return*/, (_f.response = _h.sent(),
                                        _f.index = img.index,
                                        _f.primary = img.primary,
                                        _f)];
                                case 5:
                                    _g = {};
                                    _d = (_c = connector).create;
                                    return [4 /*yield*/, serialize(img, null)];
                                case 6: return [4 /*yield*/, _d.apply(_c, [_h.sent()])];
                                case 7: 
                                // or create new
                                return [2 /*return*/, (_g.response = _h.sent(),
                                        _g.index = img.index,
                                        _g.primary = img.primary,
                                        _g)];
                            }
                        });
                    }); })
                        .map(function (request) { return __awaiter(void 0, void 0, void 0, function () {
                        var result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, request];
                                case 1:
                                    result = _a.sent();
                                    return [2 /*return*/, __assign(__assign({}, deserialize(result.response[0])), { index: result.index, primary: result.primary })];
                            }
                        });
                    }); }));
                    deletePromise = connector.deleteMultiple(images
                        .filter(function (img) {
                        return !newImages.find(function (other) {
                            return !other.id.startsWith(MultiImageNewIdPrefix) &&
                                other.id === img.id;
                        });
                    })
                        .map(function (img) { return img.id; }));
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    // wait for response
                    // deletePromise may be undefined or a promise
                    // eslint-disable-next-line @typescript-eslint/await-thenable
                    return [4 /*yield*/, deletePromise];
                case 2:
                    // wait for response
                    // deletePromise may be undefined or a promise
                    // eslint-disable-next-line @typescript-eslint/await-thenable
                    _c.sent();
                    return [4 /*yield*/, uploadPromise];
                case 3:
                    uploadedImages = _c.sent();
                    finalImages_1 = [];
                    newImages.filter(function (img) {
                        return !img.id.startsWith(MultiImageNewIdPrefix) && images.includes(img);
                    }).forEach(function (img) {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        finalImages_1[img.index] = img;
                    });
                    uploadedImages.forEach(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    function (img) { return (finalImages_1[img.index] = img); });
                    // update state
                    setImages(finalImages_1);
                    if (onPrimaryChange)
                        onPrimaryChange(name, (_b = (_a = finalImages_1.find(function (img) { return img.primary; })) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : "");
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _c.sent();
                    setError(e_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [
        additionalImages,
        connector,
        deserialize,
        images,
        primary,
        onPrimaryChange,
        name,
        serialize,
    ]);
    useEffect(function () {
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
                        setImages(initialFiles);
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
    }, []);
    useEffect(function () {
        if (onChange)
            onChange(name, images);
    }, [images, name, onChange]);
    if (loading || additionalImagesLoading)
        return React.createElement(Loader, null);
    if (loadError)
        return React.createElement("span", null, loadError.message);
    return (React.createElement(React.Fragment, null,
        error && React.createElement(ErrorComponent, { error: error }),
        React.createElement(MultiImage, __assign({}, otherProps, { images: additionalImages ? additionalImages.concat(images) : images, onChange: handleChange }))));
};
export default React.memo(CrudMultiImage);
