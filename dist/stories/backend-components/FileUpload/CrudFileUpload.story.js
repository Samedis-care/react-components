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
import React from "react";
import "../../../i18n";
import { boolean, number, select, text } from "@storybook/addon-knobs";
import { CrudFileUpload } from "../../../backend-components";
import LocalStorageConnector from "../../backend-integration/LocalStorageConnector";
import { fileToData } from "../../../utils";
import ErrorComponent from "../Form/ErrorComponent";
export var CrudFileUploadStory = function () {
    var acceptedType = select("Accepted Filetypes", {
        Everything: "",
        Images: "image/*",
        Custom: "custom",
    }, "");
    if (acceptedType === "custom") {
        acceptedType = text("Accepted Filetypes (comma-separated)", ".pdf,.docx,.xlsx,.pptx");
    }
    return (React.createElement(CrudFileUpload, { connector: new LocalStorageConnector("crud-file-upload"), serialize: function (data, id) { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            var _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _b = {};
                        if (!((_c = data.preview) !== null && _c !== void 0)) return [3 /*break*/, 1];
                        _a = _c;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, fileToData(data.file)];
                    case 2:
                        _a = (_d.sent());
                        _d.label = 3;
                    case 3: return [2 /*return*/, (_b.document = _a,
                            _b.name = data.file.name,
                            _b.id = id !== null && id !== void 0 ? id : undefined,
                            _b)];
                }
            });
        }); }, deserialize: function (data) { return ({
            file: {
                id: data.id,
                name: data.name,
                downloadLink: data.document,
            },
        }); }, errorComponent: ErrorComponent, label: text("Upload Control Label", "Label"), maxFiles: number("Max files", 3, {
            range: true,
            min: 1,
            max: 100,
            step: 1,
        }), previewSize: number("Preview size (in px)", 128, {
            range: true,
            min: 16,
            max: 4096,
            step: 16,
        }), previewImages: boolean("Preview images", true), accept: acceptedType, convertImagesTo: select("Convert Images to", {
            "Don't convert": "",
            ".png": "image/png",
            ".jpg": "image/jpg",
        }, ""), allowDuplicates: boolean("Allow duplicate files", false), imageDownscaleOptions: boolean("Enable downscaling?", false)
            ? {
                width: number("Max width", 1920, {
                    range: true,
                    min: 16,
                    max: 4096,
                    step: 16,
                }),
                height: number("Max height", 1080, {
                    range: true,
                    min: 16,
                    max: 4096,
                    step: 16,
                }),
                keepRatio: boolean("Keep aspect ratio when scaling", true),
            }
            : undefined, readOnly: boolean("Read-only", false) }));
};
CrudFileUploadStory.storyName = "CrudFileUpload";
