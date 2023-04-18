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
import React, { useCallback, useContext, useEffect, useRef } from "react";
import { useFormContextLite } from "..";
import { UnsafeToLeaveDispatch } from "../../framework/UnsafeToLeave";
import { FrameworkHistory, useDialogContext } from "../../framework";
import { showConfirmDialog, showConfirmDialogBool, showErrorDialog, } from "../../non-standalone";
import { FormDialogDispatchContext } from "./FormDialog";
import FormPageLayout from "../../standalone/Form/FormPageLayout";
import FormLoaderOverlay from "../../standalone/Form/FormLoaderOverlay";
import useCCTranslations from "../../utils/useCCTranslations";
import { useRouteInfo } from "../../utils";
var BasicFormPage = function (props) {
    var submit = props.submit, dirty = props.dirty, disableRouting = props.disableRouting, postSubmitHandler = props.postSubmitHandler, isSubmitting = props.isSubmitting, FormButtons = props.children, form = props.form, childrenProps = props.childrenProps, originalCustomProps = props.customProps, otherProps = __rest(props, ["submit", "dirty", "disableRouting", "postSubmitHandler", "isSubmitting", "children", "form", "childrenProps", "customProps"]);
    var t = useCCTranslations().t;
    var _a = useFormContextLite(), readOnly = _a.readOnly, readOnlyReason = _a.readOnlyReason;
    var pushDialog = useDialogContext()[0];
    var formDialog = useContext(FormDialogDispatchContext);
    var unblock = useRef(undefined);
    var routeUrl = useRouteInfo(disableRouting).url;
    useEffect(function () {
        // if the form isn't dirty, don't block submitting
        // if the form is read-only, don't annoy the user
        // if the form is currently submitting we automatically assume the form is no longer dirty
        // otherwise we'd run into a data race, as dirty flag is not updated during submit, only afterwards, which would
        // block the redirect to the edit page here
        if (!dirty || readOnly || isSubmitting)
            return;
        var blocker = function (transition) {
            var allowTransition = function () {
                // temp unblock to retry transaction
                if (unblock.current) {
                    unblock.current();
                    unblock.current = undefined;
                }
                transition.retry();
            };
            //console.log("History.block(", location, ",", action, ")", match);
            // special handling: routing inside form page (e.g. routed tab panels, routed stepper)
            if (!disableRouting &&
                transition.location.pathname.startsWith(routeUrl)) {
                allowTransition();
                unblock.current = FrameworkHistory.block(blocker);
                return;
            }
            // otherwise: ask user for confirmation
            void (function () { return __awaiter(void 0, void 0, void 0, function () {
                var leave;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, showConfirmDialogBool(pushDialog, {
                                title: t("backend-components.form.back-on-dirty.title"),
                                message: t("backend-components.form.back-on-dirty.message"),
                                textButtonYes: t("backend-components.form.back-on-dirty.yes"),
                                textButtonNo: t("backend-components.form.back-on-dirty.no"),
                            })];
                        case 1:
                            leave = _a.sent();
                            if (leave) {
                                allowTransition();
                            }
                            return [2 /*return*/];
                    }
                });
            }); })();
        };
        unblock.current = FrameworkHistory.block(blocker);
        var safeToLeave = UnsafeToLeaveDispatch.lock("form-dirty");
        if (formDialog)
            formDialog.blockClosing();
        return function () {
            safeToLeave();
            if (unblock.current) {
                unblock.current();
                unblock.current = undefined;
            }
            if (formDialog)
                formDialog.unblockClosing();
        };
    }, [
        isSubmitting,
        readOnly,
        t,
        dirty,
        formDialog,
        routeUrl,
        pushDialog,
        disableRouting,
    ]);
    // go back confirm dialog if form is dirty
    var customProps = __assign({}, originalCustomProps);
    if (originalCustomProps && "goBack" in originalCustomProps) {
        var orgGoBack_1 = originalCustomProps.goBack;
        customProps.goBack =
            typeof orgGoBack_1 === "function"
                ? function () { return __awaiter(void 0, void 0, void 0, function () {
                    var e_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 3, , 4]);
                                if (!(dirty && !readOnly)) return [3 /*break*/, 2];
                                return [4 /*yield*/, showConfirmDialog(pushDialog, {
                                        title: t("backend-components.form.back-on-dirty.title"),
                                        message: t("backend-components.form.back-on-dirty.message"),
                                        textButtonYes: t("backend-components.form.back-on-dirty.yes"),
                                        textButtonNo: t("backend-components.form.back-on-dirty.no"),
                                    })];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2:
                                if (unblock.current) {
                                    unblock.current();
                                    unblock.current = undefined;
                                }
                                orgGoBack_1();
                                return [3 /*break*/, 4];
                            case 3:
                                e_1 = _a.sent();
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); }
                : orgGoBack_1;
    }
    var handleSubmit = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, submit()];
                case 1:
                    _a.sent();
                    if (!postSubmitHandler) return [3 /*break*/, 6];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 6]);
                    return [4 /*yield*/, postSubmitHandler()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    e_2 = _a.sent();
                    return [4 /*yield*/, showErrorDialog(pushDialog, e_2)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [submit, postSubmitHandler, pushDialog]);
    return (React.createElement(FormPageLayout, { body: form, footer: React.createElement(FormButtons, __assign({}, childrenProps, otherProps, { showBackButtonOnly: otherProps.showBackButtonOnly || (readOnly && !readOnlyReason), readOnly: readOnly, readOnlyReason: readOnlyReason, isSubmitting: isSubmitting, dirty: dirty, disableRouting: disableRouting, submit: handleSubmit, customProps: customProps })), other: React.createElement(FormLoaderOverlay, { visible: isSubmitting }) }));
};
export default React.memo(BasicFormPage);
