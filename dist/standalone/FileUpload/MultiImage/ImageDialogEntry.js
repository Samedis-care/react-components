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
import ImageBox from "./ImageBox";
import { Box, Grid, Typography } from "@mui/material";
import { Star as StarredIcon, StarOutline as NotStarredIcon, } from "@mui/icons-material";
import makeStyles from "@mui/styles/makeStyles";
import useCCTranslations from "../../../utils/useCCTranslations";
import { makeThemeStyles } from "../../../utils";
var useStyles = makeStyles({
    clickable: {
        cursor: "pointer",
    },
}, { name: "CcImageDialogEntry" });
var useThemeStyles = makeThemeStyles(function (theme) { var _a, _b, _c; return (_c = (_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.fileUpload) === null || _b === void 0 ? void 0 : _b.multiImage) === null || _c === void 0 ? void 0 : _c.imageDialogEntry; }, "CcImageDialogEntry", useStyles);
var ImageDialogEntry = function (props) {
    var previewSize = props.previewSize, img = props.img, isPrimary = props.isPrimary, changeImages = props.changeImages, changePrimary = props.changePrimary, processFile = props.processFile, subClasses = props.subClasses, onDelete = props.onDelete;
    var t = useCCTranslations().t;
    var classes = useThemeStyles(props);
    var setPrimary = useCallback(function () {
        changePrimary(img.id);
    }, [changePrimary, img]);
    var removeImage = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!onDelete) return [3 /*break*/, 2];
                    return [4 /*yield*/, onDelete(img)];
                case 1:
                    // check for confirmation
                    if (!(_a.sent())) {
                        // if user doesn't confirm, abort
                        return [2 /*return*/];
                    }
                    _a.label = 2;
                case 2:
                    changeImages(function (images) {
                        return images.filter(function (image) { return image !== img; });
                    });
                    return [2 /*return*/];
            }
        });
    }); }, [onDelete, changeImages, img]);
    var replaceImage = useCallback(function (files) { return __awaiter(void 0, void 0, void 0, function () {
        var file, imageData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    file = files.item(0);
                    if (!file)
                        return [2 /*return*/];
                    return [4 /*yield*/, processFile(file)];
                case 1:
                    imageData = _a.sent();
                    changeImages(function (images) {
                        return images.map(function (image) {
                            return image === img ? __assign(__assign({}, image), { image: imageData }) : image;
                        });
                    });
                    return [2 /*return*/];
            }
        });
    }); }, [changeImages, img, processFile]);
    return (React.createElement(Grid, { item: true, xs: previewSize ? undefined : 12, md: previewSize ? undefined : 6, lg: previewSize ? undefined : 3 },
        React.createElement("div", null,
            React.createElement(ImageBox, { fileName: img.name, width: previewSize, height: previewSize, image: img.image, onRemove: img.readOnly ? undefined : removeImage, onFilesDropped: img.readOnly ? undefined : replaceImage, classes: subClasses === null || subClasses === void 0 ? void 0 : subClasses.imageBox })),
        React.createElement(Box, { mt: 1 },
            React.createElement(Grid, { container: true, spacing: 1, alignItems: "center", justifyContent: "flex-start", className: isPrimary ? undefined : classes.clickable, onClick: isPrimary ? undefined : setPrimary },
                React.createElement(Grid, { item: true }, isPrimary ? React.createElement(StarredIcon, { color: "primary" }) : React.createElement(NotStarredIcon, null)),
                React.createElement(Grid, { item: true },
                    React.createElement(Typography, null, t("standalone.file-upload.multi-image.primary")))))));
};
export default React.memo(ImageDialogEntry);
