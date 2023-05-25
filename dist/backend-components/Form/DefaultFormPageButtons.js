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
import React, { useCallback, useContext } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { useDialogContext } from "../../framework";
import { showConfirmDialog } from "../../non-standalone";
import { ActionButton, FormButtons } from "../../standalone";
import { IsInFormDialogContext } from "./FormDialog";
import useCCTranslations from "../../utils/useCCTranslations";
import { Tooltip } from "@mui/material";
export var useBackButtonStyles = makeStyles({
    root: {
        backgroundColor: "#bcbdbf",
        boxShadow: "none",
        border: "none",
        "&:hover": {
            boxShadow: "none",
            border: "none",
        },
    },
});
var DefaultFormPageButtons = function (props) {
    var showBackButtonOnly = props.showBackButtonOnly, readOnly = props.readOnly, readOnlyReason = props.readOnlyReason, dirty = props.dirty, isSubmitting = props.isSubmitting, submit = props.submit, customProps = props.customProps, confirmDialogMessage = props.confirmDialogMessage;
    var goBack = customProps === null || customProps === void 0 ? void 0 : customProps.goBack;
    var hasCustomCloseHandler = customProps === null || customProps === void 0 ? void 0 : customProps.hasCustomSubmitHandler;
    var t = useCCTranslations().t;
    var backButtonClasses = useBackButtonStyles();
    var isInDialog = useContext(IsInFormDialogContext);
    var pushDialog = useDialogContext()[0];
    var displayConfirmDialog = !!confirmDialogMessage;
    var submitWithConfirmDialog = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_1, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, showConfirmDialog(pushDialog, {
                            title: t("common.dialogs.are-you-sure"),
                            message: confirmDialogMessage !== null && confirmDialogMessage !== void 0 ? confirmDialogMessage : t("common.dialogs.are-you-sure-submit"),
                            textButtonYes: t("common.buttons.yes"),
                            textButtonNo: t("common.buttons.cancel"),
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    // user cancelled
                    return [2 /*return*/];
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, submit()];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_1 = _a.sent();
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [confirmDialogMessage, pushDialog, submit, t]);
    var safeSubmit = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, submit()];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_2 = _a.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [submit]);
    var handleBack = useCallback(function () { return goBack && goBack(); }, [goBack]);
    var saveBtn = (React.createElement(ActionButton, { disabled: !dirty || isSubmitting || readOnly, onClick: displayConfirmDialog ? submitWithConfirmDialog : safeSubmit }, t("common.buttons.save")));
    return (React.createElement(FormButtons, null,
        !showBackButtonOnly &&
            (readOnly && readOnlyReason ? (React.createElement(Tooltip, { title: readOnlyReason },
                React.createElement("span", null, saveBtn))) : (saveBtn)),
        goBack && !(isInDialog && hasCustomCloseHandler) && (React.createElement(ActionButton, { disabled: isSubmitting, onClick: handleBack, classes: backButtonClasses }, t("common.buttons.back")))));
};
export default React.memo(DefaultFormPageButtons);