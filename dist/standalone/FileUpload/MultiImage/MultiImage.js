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
import React, { useCallback, useEffect, useMemo, useRef, useState, } from "react";
import ImageBox from "./ImageBox";
import { GroupBox } from "../../index";
import { DialogTitle, DialogContent, Grid, Link, Typography, Dialog, IconButton, } from "@material-ui/core";
import { Close as CloseIcon } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { makeThemeStyles, processImage } from "../../../utils";
import ImageDialogEntry from "./ImageDialogEntry";
import useCCTranslations from "../../../utils/useCCTranslations";
import ImageDots from "./ImageDots";
var useStyles = makeStyles({
    uploadInput: {
        display: "none",
    },
    clickable: {
        cursor: "pointer",
    },
    rootContainer: {
        height: "100%",
    },
    imageItem: {
        height: "calc(100% - 1rem)",
    },
}, { name: "CcMultiImage" });
var useThemeStyles = makeThemeStyles(function (theme) { var _a, _b, _c; return (_c = (_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.fileUpload) === null || _b === void 0 ? void 0 : _b.multiImage) === null || _c === void 0 ? void 0 : _c.root; }, "CcMultiImage", useStyles);
export var MultiImageNewIdPrefix = "MultiImage-New-";
var MultiImage = function (props) {
    var _a, _b, _c, _d, _e;
    var label = props.label, name = props.name, editLabel = props.editLabel, additionalDialogContent = props.additionalDialogContent, images = props.images, primary = props.primary, placeholderImage = props.placeholderImage, uploadImage = props.uploadImage, readOnly = props.readOnly, maxImages = props.maxImages, capture = props.capture, convertImagesTo = props.convertImagesTo, downscale = props.downscale, onChange = props.onChange, onPrimaryChange = props.onPrimaryChange, subClasses = props.subClasses, onDelete = props.onDelete;
    var previewSize = (_a = props.previewSize) !== null && _a !== void 0 ? _a : 256;
    var t = useCCTranslations().t;
    var classes = useThemeStyles(props);
    var primaryImg = useMemo(function () { var _a; return (_a = images.find(function (img) { return img.id === primary; })) !== null && _a !== void 0 ? _a : images[0]; }, [images, primary]);
    // images.indexOf(undefined) works and returns -1
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    var getPrimaryImageIndex = function () { return images.indexOf(primaryImg); };
    // update primary image ID if it becomes invalid
    useEffect(function () {
        if (!onPrimaryChange)
            return;
        if (!primaryImg) {
            onPrimaryChange(name, null);
            return;
        }
        if (primaryImg.id === primary)
            return;
        onPrimaryChange(name, primaryImg.id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onPrimaryChange, primary, primaryImg]);
    var _f = useState(false), dialogOpen = _f[0], setDialogOpen = _f[1];
    var _g = useState(getPrimaryImageIndex), currentImage = _g[0], setCurrentImage = _g[1];
    var fileUpload = useRef(null);
    var openDialog = useCallback(function () {
        setDialogOpen(true);
    }, []);
    var closeDialog = useCallback(function () {
        setDialogOpen(false);
    }, []);
    var remainingFiles = useMemo(function () {
        return maxImages
            ? Math.max(images.length - maxImages, 0)
            : Number.MAX_SAFE_INTEGER;
    }, [maxImages, images]);
    var startUpload = useCallback(function () {
        if (readOnly)
            return;
        if (!fileUpload.current)
            return;
        fileUpload.current.click();
    }, [readOnly]);
    var processFile = useCallback(function (file) {
        return processImage(file, convertImagesTo, downscale);
    }, [convertImagesTo, downscale]);
    var processFiles = useCallback(function (files) { return __awaiter(void 0, void 0, void 0, function () {
        var fileArr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fileArr = Array.from(files);
                    return [4 /*yield*/, Promise.all(fileArr.map(processFile))];
                case 1: return [2 /*return*/, (_a.sent()).map(function (img, index) { return ({
                        id: "".concat(MultiImageNewIdPrefix).concat(new Date().getTime(), "-").concat(index),
                        image: img,
                        name: fileArr[index].name,
                    }); })];
            }
        });
    }); }, [processFile]);
    var handleUploadViaDrop = useCallback(function (files) { return __awaiter(void 0, void 0, void 0, function () {
        var newImages;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!onChange)
                        return [2 /*return*/];
                    return [4 /*yield*/, processFiles(files)];
                case 1:
                    newImages = _a.sent();
                    onChange(name, images.concat(newImages));
                    return [2 /*return*/];
            }
        });
    }); }, [processFiles, name, images, onChange]);
    var handlePreviewDrop = useCallback(function (files) { return __awaiter(void 0, void 0, void 0, function () {
        var newImages;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!onChange)
                        return [2 /*return*/];
                    if (files.length === 0)
                        return [2 /*return*/];
                    return [4 /*yield*/, processFiles(files)];
                case 1:
                    newImages = _a.sent();
                    onChange(name, images.concat(newImages));
                    if (onPrimaryChange)
                        onPrimaryChange(name, newImages[0].id);
                    return [2 /*return*/];
            }
        });
    }); }, [onChange, name, images, processFiles, onPrimaryChange]);
    var handleUpload = useCallback(function (evt) {
        var files = evt.target.files;
        if (!files)
            return;
        void handleUploadViaDrop(files);
    }, [handleUploadViaDrop]);
    useEffect(function () {
        if (currentImage >= images.length) {
            setCurrentImage(images.length - 1);
        }
    }, [currentImage, images]);
    useEffect(function () {
        setCurrentImage(getPrimaryImageIndex);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getPrimaryImageIndex()]);
    var showPrevImage = useCallback(function () {
        setCurrentImage(function (prev) { return (prev === 0 ? prev : prev - 1); });
    }, []);
    var showNextImage = useCallback(function () {
        setCurrentImage(function (prev) { return prev + 1; });
    }, []);
    var manipulateImages = useCallback(function (process) {
        if (!onChange)
            return;
        onChange(name, process(images));
    }, [onChange, name, images]);
    var changePrimary = useCallback(function (id) {
        if (!onPrimaryChange)
            return;
        onPrimaryChange(name, id);
    }, [onPrimaryChange, name]);
    return (React.createElement(React.Fragment, null,
        React.createElement(GroupBox, { label: label },
            React.createElement(Grid, { container: true, spacing: 1, className: classes.rootContainer },
                React.createElement(Grid, { item: true, xs: 12, className: classes.imageItem },
                    React.createElement(ImageBox, { image: (_d = (_c = (_b = images[currentImage]) === null || _b === void 0 ? void 0 : _b.image) !== null && _c !== void 0 ? _c : placeholderImage) !== null && _d !== void 0 ? _d : uploadImage, fileName: (_e = images[currentImage]) === null || _e === void 0 ? void 0 : _e.name, onPrevImage: currentImage <= 0 ? undefined : showPrevImage, onNextImage: currentImage < images.length - 1 ? showNextImage : undefined, onFilesDropped: readOnly ? undefined : handlePreviewDrop, onClick: images[currentImage] ? undefined : readOnly ? null : startUpload, classes: subClasses === null || subClasses === void 0 ? void 0 : subClasses.imageBox, imageDots: {
                            total: images.length,
                            active: currentImage,
                            setActive: setCurrentImage,
                        }, disableBackground: true })),
                React.createElement(Grid, { item: true, xs: 12, container: true, alignContent: "space-between", wrap: "nowrap", spacing: 1 },
                    React.createElement(Grid, { item: true, xs: true },
                        React.createElement(ImageDots, { total: images.length, active: currentImage, setActive: setCurrentImage })),
                    !readOnly && (React.createElement(Grid, { item: true },
                        React.createElement(Typography, { variant: "body2" },
                            React.createElement(Link, { onClick: openDialog, className: classes.clickable }, editLabel !== null && editLabel !== void 0 ? editLabel : t("standalone.file-upload.multi-image.edit")))))))),
        React.createElement("input", { type: "file", multiple: remainingFiles > 1, accept: "image/*", capture: capture, ref: fileUpload, onChange: handleUpload, className: classes.uploadInput }),
        !readOnly && (React.createElement(React.Fragment, null,
            React.createElement(Dialog, { open: dialogOpen, onClose: closeDialog, maxWidth: "lg", fullWidth: !previewSize },
                React.createElement(DialogTitle, null,
                    React.createElement(Grid, { container: true, justify: "flex-end" },
                        React.createElement(Grid, { item: true },
                            React.createElement(IconButton, { onClick: closeDialog },
                                React.createElement(CloseIcon, null))))),
                React.createElement(DialogContent, null,
                    React.createElement(Grid, { container: true, spacing: 2 },
                        images.map(function (img, i) { return (React.createElement(ImageDialogEntry, { img: img, previewSize: previewSize, isPrimary: img === primaryImg, processFile: processFile, changeImages: manipulateImages, changePrimary: changePrimary, onDelete: onDelete, key: "img-".concat(i), classes: subClasses === null || subClasses === void 0 ? void 0 : subClasses.imageDialogEntry, subClasses: subClasses === null || subClasses === void 0 ? void 0 : subClasses.imageDialogEntrySubClasses })); }),
                        !readOnly && remainingFiles > 0 && (React.createElement(Grid, { item: true, xs: previewSize ? undefined : 12, md: previewSize ? undefined : 6, lg: previewSize ? undefined : 3 },
                            React.createElement(ImageBox, { width: previewSize, height: previewSize, image: uploadImage, onClick: startUpload, onFilesDropped: handleUploadViaDrop, classes: subClasses === null || subClasses === void 0 ? void 0 : subClasses.imageBox }))), additionalDialogContent === null || additionalDialogContent === void 0 ? void 0 :
                        additionalDialogContent.map(function (elem, i) { return (React.createElement(Grid, { item: true, xs: previewSize ? undefined : 12, md: previewSize ? undefined : 6, lg: previewSize ? undefined : 3, key: "add-".concat(i), style: previewSize ? { width: previewSize } : undefined }, elem)); }))))))));
};
export default React.memo(MultiImage);
