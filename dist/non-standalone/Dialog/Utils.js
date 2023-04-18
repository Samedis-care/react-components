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
import React from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { InputDialog } from "./InputDialog";
import { InfoDialog } from "./InfoDialog";
import i18n from "../../i18n";
import { ErrorDialog } from "./ErrorDialog";
/**
 * Shows an awaitable confirm dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties
 * @returns Awaitable promise, resolves if user clicks Yes, rejects otherwise
 */
export var showConfirmDialog = function (pushDialog, props) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                pushDialog(React.createElement(ConfirmDialog, __assign({}, props, { onClose: reject, handlerButtonYes: resolve, handlerButtonNo: reject })));
            })];
    });
}); };
/**
 * Shows an awaitable confirm dialog (returns boolean)
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties
 * @returns Awaitable promise, resolves to true if user clicks yes, to false if user clicks no or closes dialog
 */
export var showConfirmDialogBool = function (pushDialog, props) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve) {
                pushDialog(React.createElement(ConfirmDialog, __assign({}, props, { onClose: function () { return resolve(false); }, handlerButtonYes: function () { return resolve(true); }, handlerButtonNo: function () { return resolve(false); } })));
            })];
    });
}); };
/**
 * Shows an awaitable input dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties
 * @returns Awaitable promise, resolves if user clicks Yes, rejects otherwise
 */
export var showInputDialog = function (pushDialog, props) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                pushDialog(React.createElement(InputDialog, __assign({}, props, { onClose: reject, handlerButtonYes: resolve, handlerButtonNo: reject })));
            })];
    });
}); };
/**
 * Shows an info dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog properties (with buttons optional, defaults to an Okay button)
 * @return A promise which resolves when the dialog is closed
 */
export var showInfoDialog = function (pushDialog, props) {
    var title = props.title, message = props.message, buttons = props.buttons;
    return new Promise(function (resolve) {
        pushDialog(React.createElement(InfoDialog, { title: title, message: message, buttons: buttons !== null && buttons !== void 0 ? buttons : [
                {
                    text: i18n.t("non-standalone.dialog.okay"),
                    autoFocus: true,
                },
            ], onClose: resolve }));
    });
};
/**
 * Shows an error dialog
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param e The error or validation error
 * @return A promise which resolves when the dialog is closed
 */
export var showErrorDialog = function (pushDialog, e) {
    // display generic errors and validation errors
    var errorTitle = "";
    var errorMsg = "";
    if (e instanceof Error) {
        errorTitle = i18n.t("common.dialogs.error-title");
        errorMsg = e.message;
    }
    else if (typeof e === "string") {
        errorTitle = i18n.t("common.dialogs.error-title");
        errorMsg = e;
    }
    else {
        // validation error
        errorTitle = i18n.t("common.dialogs.validation-error-title");
        errorMsg = (React.createElement("ul", null, Object.entries(e).map(function (_a) {
            var key = _a[0], value = _a[1];
            return (React.createElement("li", { key: key }, value));
        })));
    }
    return new Promise(function (resolve) {
        pushDialog(React.createElement(ErrorDialog, { title: errorTitle, message: errorMsg, buttons: [
                {
                    text: i18n.t("common.buttons.ok"),
                    autoFocus: true,
                },
            ], onClose: resolve }));
    });
};
