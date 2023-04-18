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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState, } from "react";
import { useModelDelete, useModelGet, useModelMutation, } from "../../backend-integration/Model/Model";
import Loader from "../../standalone/Loader";
import { deepAssign, deepClone, dotInObject, dotSet, dotsToObject, dotToObject, getValueByDot, isObjectEmpty, } from "../../utils";
import { Grid, Typography } from "@mui/material";
import { getVisibility } from "../../backend-integration/Model/Visibility";
import { showConfirmDialogBool } from "../../non-standalone";
import useCCTranslations from "../../utils/useCCTranslations";
import { useDialogContext } from "../../framework";
import deepSort from "../../utils/deepSort";
// optional import
var captureException = null;
import("@sentry/react")
    .then(function (Sentry) { return (captureException = Sentry.captureException); })
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .catch(function () { }); // ignore
export var OnlySubmitMountedBehaviour;
(function (OnlySubmitMountedBehaviour) {
    /**
     * Omit the unmounted values from backend POST/PUT requests entirely
     */
    OnlySubmitMountedBehaviour["OMIT"] = "omit";
    /**
     * Replace the unmounted values with their default values on POST/PUT requests
     */
    OnlySubmitMountedBehaviour["DEFAULT"] = "default";
    /**
     * Replace the unmounted values with null on POST/PUT requests
     */
    OnlySubmitMountedBehaviour["NULL"] = "null";
})(OnlySubmitMountedBehaviour || (OnlySubmitMountedBehaviour = {}));
/**
 * Context which stores information about the current form so it can be used by fields
 */
export var FormContext = React.createContext(null);
export var useFormContext = function () {
    var ctx = useContext(FormContext);
    if (!ctx)
        throw new Error("Form Context not set. Not using form engine?");
    return ctx;
};
export var FormContextLite = React.createContext(null);
export var useFormContextLite = function () {
    var ctx = useContext(FormContextLite);
    if (!ctx)
        throw new Error("Form Context (Lite) not set. Not using form engine?");
    return ctx;
};
var loaderContainerStyles = {
    height: 320,
    width: 320,
    margin: "auto",
};
var getUpdateData = function (values, model, onlySubmitMounted, onlySubmitMountedBehaviour, mountedFields, defaultRecord, id) {
    var isMounted = function (key) {
        return key === "id" ||
            mountedFields[key] ||
            getVisibility(model.fields[key].visibility[id ? "edit" : "create"], values, values).hidden;
    };
    return !onlySubmitMounted
        ? values
        : (function () {
            var result = {};
            var behaviour = onlySubmitMountedBehaviour;
            for (var field in model.fields) {
                var mounted = isMounted(field);
                if (mounted) {
                    result[field] = getValueByDot(field, values);
                    continue;
                }
                if (behaviour === OnlySubmitMountedBehaviour.OMIT) {
                    // no action
                }
                else if (behaviour === OnlySubmitMountedBehaviour.NULL) {
                    result[field] = null;
                }
                else if (behaviour === OnlySubmitMountedBehaviour.DEFAULT) {
                    result[field] = getValueByDot(field, defaultRecord);
                }
                else {
                    throw new Error("Invalid onlySubmitMountedBehaviour ".concat(behaviour));
                }
            }
            return dotsToObject(result);
        })();
};
/**
 * Normalizes data for validation to ensure dirty flag matches user perception
 * @param data The data to normalize
 * @param config The config
 */
var normalizeValues = function (data, config) {
    if (typeof data !== "object")
        throw new Error("Only Record<string, unknown> supported");
    var ignoreFields = config.ignoreFields, model = config.model, onlySubmitMounted = config.onlySubmitMounted, onlySubmitMountedBehaviour = config.onlySubmitMountedBehaviour, mountedFields = config.mountedFields, defaultRecord = config.defaultRecord;
    data = getUpdateData(data, model, onlySubmitMounted, onlySubmitMountedBehaviour, mountedFields, defaultRecord, data.id);
    var normalizedData = {};
    Object.entries(data).forEach(function (_a) {
        var k = _a[0], v = _a[1];
        var shouldBeNulled = v === "" || (Array.isArray(v) && v.length === 0);
        normalizedData[k] = shouldBeNulled ? null : v;
    });
    if (ignoreFields) {
        ignoreFields.forEach(function (field) {
            normalizedData = dotSet(field, normalizedData, null);
        });
    }
    return deepSort(normalizedData);
};
var Form = function (props) {
    var _a;
    var model = props.model, id = props.id, children = props.children, onSubmit = props.onSubmit, customProps = props.customProps, onlyValidateMounted = props.onlyValidateMounted, onlyWarnMounted = props.onlyWarnMounted, onlySubmitMounted = props.onlySubmitMounted, readOnly = props.readOnly, readOnlyReason = props.readOnlyReason, disableValidation = props.disableValidation, nestedFormName = props.nestedFormName, disableNestedSubmit = props.disableNestedSubmit, nestedFormPreSubmitHandler = props.nestedFormPreSubmitHandler, deleteOnSubmit = props.deleteOnSubmit, onDeleted = props.onDeleted, initialRecord = props.initialRecord, onlySubmitNestedIfMounted = props.onlySubmitNestedIfMounted, formClass = props.formClass, preSubmit = props.preSubmit, dirtyIgnoreFields = props.dirtyIgnoreFields;
    var onlySubmitMountedBehaviour = (_a = props.onlySubmitMountedBehaviour) !== null && _a !== void 0 ? _a : OnlySubmitMountedBehaviour.OMIT;
    var ErrorComponent = props.errorComponent;
    var t = useCCTranslations().t;
    var pushDialog = useDialogContext()[0];
    // custom fields - dirty state
    // v1
    var _b = useState(0), customDirtyCounter = _b[0], setCustomDirtyCounter = _b[1];
    // v2
    var _c = useState([]), customDirtyFields = _c[0], setCustomDirtyFields = _c[1];
    var setCustomFieldDirty = useCallback(function (field, dirty) {
        setCustomDirtyFields(function (prev) {
            var prevDirty = prev.includes(field);
            if (prevDirty == dirty)
                return prev; // no changes
            if (dirty)
                return __spreadArray(__spreadArray([], prev, true), [field], false);
            else
                return prev.filter(function (candidate) { return candidate !== field; });
        });
    }, []);
    var customDirty = customDirtyCounter > 0 || customDirtyFields.length > 0;
    // custom fields - pre submit handlers
    var preSubmitHandlers = useRef({});
    var setPreSubmitHandler = useCallback(function (field, handler) {
        preSubmitHandlers.current[field] = handler;
    }, []);
    var removePreSubmitHandler = useCallback(function (field) {
        delete preSubmitHandlers.current[field];
    }, []);
    // custom fields - custom validation handlers
    var customValidationHandlers = useRef({});
    var setCustomValidationHandler = useCallback(function (field, handler) {
        customValidationHandlers.current[field] = handler;
    }, []);
    var removeCustomValidationHandler = useCallback(function (field) {
        delete customValidationHandlers.current[field];
    }, []);
    // custom fields - custom warning handlers
    var customWarningHandlers = useRef({});
    var setCustomWarningHandler = useCallback(function (field, handler) {
        customWarningHandlers.current[field] = handler;
    }, []);
    var removeCustomWarningHandler = useCallback(function (field) {
        delete customWarningHandlers.current[field];
    }, []);
    // custom fields - post submit handlers
    var postSubmitHandlers = useRef({});
    var setPostSubmitHandler = useCallback(function (field, handler) {
        postSubmitHandlers.current[field] = handler;
    }, []);
    var removePostSubmitHandler = useCallback(function (field) {
        delete postSubmitHandlers.current[field];
    }, []);
    // custom fields - state
    var customFieldState = useRef({});
    var getCustomState = useCallback(function (field) { return customFieldState.current[field]; }, []);
    var setCustomState = useCallback(function (field, value) {
        customFieldState.current[field] =
            typeof value === "function"
                ? value(customFieldState.current[field])
                : value;
    }, []);
    // main form handling
    var _d = useState(false), deleted = _d[0], setDeleted = _d[1];
    useEffect(function () {
        // clear deleted state upon id change
        setDeleted(false);
    }, [id]);
    var _e = useModelGet(model, deleted ? null : id || null), isLoading = _e.isLoading, error = _e.error, serverData = _e.data, refetch = _e.refetch;
    var updateData = useModelMutation(model).mutateAsync;
    var deleteRecord = useModelDelete(model).mutateAsync;
    var _f = useModelGet(model, null), isDefaultRecordLoading = _f.isLoading, defaultRecord = _f.data, defaultRecordError = _f.error;
    var _g = useState(null), updateError = _g[0], setUpdateError = _g[1];
    var valuesRef = useRef({});
    var _h = useState({}), values = _h[0], setValues = _h[1];
    var _j = useState({}), touched = _j[0], setTouched = _j[1];
    var _k = useState({}), errors = _k[0], setErrors = _k[1];
    var _l = useState({}), warnings = _l[0], setWarnings = _l[1];
    var _m = useState(false), submittingForm = _m[0], setSubmittingForm = _m[1];
    var _o = useState(false), submittingBlocked = _o[0], setSubmittingBlocked = _o[1];
    var _p = useState([]), submittingBlocker = _p[0], setSubmittingBlocker = _p[1];
    var addSubmittingBlocker = useCallback(function (name) {
        setSubmittingBlocker(function (prev) { return __spreadArray(__spreadArray([], prev, true), [name], false); });
    }, []);
    var removeSubmittingBlocker = useCallback(function (name) {
        setSubmittingBlocker(function (prev) { return prev.filter(function (entry) { return entry !== name; }); });
    }, []);
    var submitting = submittingForm && !submittingBlocked && submittingBlocker.length === 0;
    // main form handling - validation disable toggle
    useEffect(function () {
        if (!disableValidation)
            return;
        setErrors({});
        setWarnings({});
    }, [disableValidation]);
    // main form handling - mounted state tracking
    var _q = useState(function () {
        return Object.fromEntries(Object.keys(model.fields).map(function (field) { return [field, false]; }));
    }), mountedFields = _q[0], setMountedFields = _q[1];
    var markFieldMounted = useCallback(function (field, mounted) {
        setMountedFields(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = mounted, _a)));
        });
    }, []);
    // main form handling - dirty state
    var dirty = useMemo(function () {
        return serverData && defaultRecord
            ? JSON.stringify(normalizeValues(values, {
                ignoreFields: dirtyIgnoreFields,
                model: model,
                defaultRecord: defaultRecord[0],
                onlySubmitMountedBehaviour: onlySubmitMountedBehaviour,
                onlySubmitMounted: onlySubmitMounted !== null && onlySubmitMounted !== void 0 ? onlySubmitMounted : false,
                mountedFields: mountedFields,
            })) !==
                JSON.stringify(normalizeValues(serverData[0], {
                    ignoreFields: dirtyIgnoreFields,
                    model: model,
                    defaultRecord: defaultRecord[0],
                    onlySubmitMountedBehaviour: onlySubmitMountedBehaviour,
                    onlySubmitMounted: onlySubmitMounted !== null && onlySubmitMounted !== void 0 ? onlySubmitMounted : false,
                    mountedFields: mountedFields,
                }))
            : false;
    }, [
        serverData,
        defaultRecord,
        values,
        dirtyIgnoreFields,
        model,
        onlySubmitMountedBehaviour,
        onlySubmitMounted,
        mountedFields,
    ]) ||
        customDirty ||
        !!(id && !deleted && deleteOnSubmit);
    // main form handling - dispatch
    var validateForm = useCallback(function (mode, values) {
        if (mode === void 0) { mode = "normal"; }
        return __awaiter(void 0, void 0, void 0, function () {
            var errors;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (disableValidation)
                            return [2 /*return*/, {}];
                        return [4 /*yield*/, model.validate(values !== null && values !== void 0 ? values : valuesRef.current, id ? "edit" : "create", onlyValidateMounted || (mode === "hint" && onlyWarnMounted)
                                ? Object.keys(mountedFields).filter(function (field) { return mountedFields[field]; })
                                : undefined, mode)];
                    case 1:
                        errors = _a.sent();
                        return [4 /*yield*/, Promise.all(Object.entries(mode === "normal"
                                ? customValidationHandlers.current
                                : customWarningHandlers.current).map(function (_a) {
                                var name = _a[0], handler = _a[1];
                                return __awaiter(void 0, void 0, void 0, function () {
                                    var customErrors, key;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0: return [4 /*yield*/, handler()];
                                            case 1:
                                                customErrors = _b.sent();
                                                for (key in customErrors) {
                                                    if (!Object.prototype.hasOwnProperty.call(customErrors, key))
                                                        continue;
                                                    errors[name + "_" + key] = customErrors[key];
                                                }
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            }))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, errors];
                }
            });
        });
    }, [
        disableValidation,
        model,
        id,
        onlyValidateMounted,
        onlyWarnMounted,
        mountedFields,
    ]);
    var validateField = useCallback(function (field, value) { return __awaiter(void 0, void 0, void 0, function () {
        var values, errors, warnings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    values = value !== undefined
                        ? deepAssign({}, valuesRef.current, dotToObject(field, value))
                        : undefined;
                    return [4 /*yield*/, validateForm("normal", values)];
                case 1:
                    errors = _a.sent();
                    return [4 /*yield*/, validateForm("hint", values)];
                case 2:
                    warnings = _a.sent();
                    setErrors(errors);
                    setWarnings(warnings);
                    return [2 /*return*/];
            }
        });
    }); }, [validateForm]);
    var setFieldTouchedLite = useCallback(function (field, newTouched) {
        if (newTouched === void 0) { newTouched = false; }
        setTouched(function (prev) {
            var _a;
            return prev[field] === newTouched
                ? prev
                : __assign(__assign({}, prev), (_a = {}, _a[field] = newTouched, _a));
        });
    }, []);
    var setFieldTouched = useCallback(function (field, newTouched, validate) {
        if (newTouched === void 0) { newTouched = true; }
        if (validate === void 0) { validate = false; }
        setFieldTouchedLite(field, newTouched);
        if (validate)
            void validateField(field);
    }, [setFieldTouchedLite, validateField]);
    var getFieldValue = useCallback(function (field) {
        return getValueByDot(field, valuesRef.current);
    }, []);
    var getFieldValues = useCallback(function () {
        return valuesRef.current;
    }, []);
    var setFieldValue = useCallback(function (field, value, validate, triggerOnChange // default false to prevent recursion
    ) {
        if (validate === void 0) { validate = true; }
        if (triggerOnChange === void 0) { triggerOnChange = false; }
        if (triggerOnChange) {
            var onChange = model.fields[field].onChange;
            if (onChange) {
                value = onChange(value, model, setFieldValue, getFieldValue);
                if (value === undefined && process.env.NODE_ENV === "development") {
                    // eslint-disable-next-line no-console
                    console.error("[Components-Care] [Form] onChange handler for field '".concat(field, "' returned undefined. Missing return?"));
                }
            }
        }
        setFieldTouched(field, true, false);
        valuesRef.current = dotSet(field, valuesRef.current, value);
        setValues(valuesRef.current);
        if (validate)
            void validateField(field, value);
    }, [setFieldTouched, validateField, model, getFieldValue]);
    var setFieldValueLite = useCallback(function (field, value) {
        setFieldTouchedLite(field, true);
        valuesRef.current = dotSet(field, valuesRef.current, value);
        setValues(valuesRef.current);
    }, [setFieldTouchedLite]);
    var resetForm = useCallback(function () {
        if (!serverData || !serverData[0])
            return;
        valuesRef.current = deepClone(serverData[0]);
        setValues(valuesRef.current);
    }, [serverData]);
    var handleBlur = useCallback(function (evt) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        var fieldName = (_k = (_h = (_f = (_d = (_b = (_a = evt.currentTarget) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : (_c = evt.currentTarget) === null || _c === void 0 ? void 0 : _c.getAttribute("data-name")) !== null && _d !== void 0 ? _d : (_e = evt.currentTarget) === null || _e === void 0 ? void 0 : _e.id) !== null && _f !== void 0 ? _f : (_g = evt.target) === null || _g === void 0 ? void 0 : _g.name) !== null && _h !== void 0 ? _h : (_j = evt.target) === null || _j === void 0 ? void 0 : _j.getAttribute("data-name")) !== null && _k !== void 0 ? _k : (_l = evt.target) === null || _l === void 0 ? void 0 : _l.id;
        if (!fieldName) {
            // eslint-disable-next-line no-console
            console.error("[Components-Care] [Form] Handling on blur event for element without name. Please set form name via one of these attributes: name, data-name or id", evt);
            return;
        }
        setFieldTouched(fieldName);
    }, [setFieldTouched]);
    // init data structs after first load
    useEffect(function () {
        if (isLoading || !serverData || !serverData[0])
            return;
        valuesRef.current = deepClone(serverData[0]);
        setValues(valuesRef.current);
        setTouched(Object.fromEntries(Object.keys(model.fields).map(function (key) { return [key, false]; })));
        if (initialRecord && id == null) {
            void Promise.all(Object.entries(initialRecord).map(function (_a) {
                var key = _a[0], value = _a[1];
                return setFieldValue(key, value, false);
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading]);
    // update data struct after background fetch
    useEffect(function () {
        if (isLoading || !serverData || !serverData[0])
            return;
        var newValues = deepClone(valuesRef.current);
        var serverRecord = deepClone(serverData[0]);
        var untouchedFields = Object.entries(touched)
            .filter(function (_a) {
            var touched = _a[1];
            return !touched;
        })
            .map(function (_a) {
            var field = _a[0];
            return field;
        });
        untouchedFields
            .filter(function (field) { return dotInObject(field, serverRecord); })
            .forEach(function (field) {
            deepAssign(newValues, dotToObject(field, getValueByDot(field, serverRecord)));
        });
        valuesRef.current = newValues;
        setValues(newValues);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverData]);
    // main form - submit handler
    var submitForm = useCallback(function (params) { return __awaiter(void 0, void 0, void 0, function () {
        var cancelSubmit, e_1, id_1, e_2, throwIsWarning, validationHints, validation, continueSubmit, submitValues, oldValues, result, newValues_1, e_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!serverData)
                        throw new Error("serverData is null"); // should never happen
                    if (!defaultRecord)
                        throw new Error("default record is null"); // should never happen
                    if (params && "nativeEvent" in params)
                        params = undefined;
                    if (!params)
                        params = {};
                    if (!preSubmit) return [3 /*break*/, 5];
                    cancelSubmit = void 0;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, preSubmit({
                            serverData: (_a = (serverData && serverData[0])) !== null && _a !== void 0 ? _a : valuesRef.current,
                            formData: valuesRef.current,
                            submitOptions: params,
                            deleteOnSubmit: !!deleteOnSubmit,
                            setFieldValue: setFieldValue,
                        })];
                case 2:
                    cancelSubmit = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _b.sent();
                    if (captureException)
                        captureException(e_1);
                    // eslint-disable-next-line no-console
                    console.error("[Components-Care] [FormEngine] Pre-submit handler threw exception", e_1);
                    cancelSubmit = true;
                    return [3 /*break*/, 4];
                case 4:
                    if (cancelSubmit) {
                        return [2 /*return*/];
                    }
                    _b.label = 5;
                case 5:
                    setSubmittingForm(true);
                    setTouched(function (prev) {
                        return Object.fromEntries(Object.keys(prev).map(function (field) { return [field, true]; }));
                    });
                    if (!deleteOnSubmit) return [3 /*break*/, 12];
                    _b.label = 6;
                case 6:
                    _b.trys.push([6, 9, 10, 11]);
                    id_1 = valuesRef.current.id;
                    if (!id_1) return [3 /*break*/, 8];
                    setDeleted(true);
                    return [4 /*yield*/, deleteRecord(id_1)];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8:
                    if (onDeleted)
                        onDeleted(id_1);
                    return [3 /*break*/, 11];
                case 9:
                    e_2 = _b.sent();
                    setDeleted(false);
                    if (e_2 instanceof Error) {
                        setUpdateError(e_2);
                    }
                    throw e_2;
                case 10:
                    setSubmittingForm(false);
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
                case 12:
                    throwIsWarning = false;
                    _b.label = 13;
                case 13:
                    _b.trys.push([13, 23, 24, 25]);
                    return [4 /*yield*/, validateForm("hint")];
                case 14:
                    validationHints = _b.sent();
                    setWarnings(validationHints);
                    return [4 /*yield*/, validateForm("normal")];
                case 15:
                    validation = _b.sent();
                    setErrors(validation);
                    if (!isObjectEmpty(validation)) {
                        // noinspection ExceptionCaughtLocallyJS
                        throw validation;
                    }
                    if (!(!isObjectEmpty(validationHints) &&
                        !params.ignoreWarnings &&
                        !nestedFormName)) return [3 /*break*/, 17];
                    setSubmittingBlocked(true);
                    return [4 /*yield*/, showConfirmDialogBool(pushDialog, {
                            title: t("backend-components.form.submit-with-warnings.title"),
                            message: (React.createElement(Grid, { container: true, spacing: 2 },
                                React.createElement(Grid, { item: true, xs: 12 }, t("backend-components.form.submit-with-warnings.message")),
                                React.createElement(Grid, { item: true, xs: 12 },
                                    React.createElement("ul", null, Object.entries(validationHints).map(function (_a) {
                                        var key = _a[0], value = _a[1];
                                        return (React.createElement("li", { key: key }, value));
                                    }))))),
                            textButtonYes: t("backend-components.form.submit-with-warnings.yes"),
                            textButtonNo: t("backend-components.form.submit-with-warnings.no"),
                        })];
                case 16:
                    continueSubmit = _b.sent();
                    setSubmittingBlocked(false);
                    if (!continueSubmit) {
                        throwIsWarning = true;
                        // noinspection ExceptionCaughtLocallyJS
                        throw validationHints;
                    }
                    _b.label = 17;
                case 17: return [4 /*yield*/, Promise.all(Object.values(preSubmitHandlers.current).map(function (handler) {
                        return handler(id, params);
                    }))];
                case 18:
                    _b.sent();
                    submitValues = valuesRef.current;
                    oldValues = serverData[0];
                    return [4 /*yield*/, updateData(getUpdateData(valuesRef.current, model, onlySubmitMounted !== null && onlySubmitMounted !== void 0 ? onlySubmitMounted : false, onlySubmitMountedBehaviour, mountedFields, defaultRecord[0], id))];
                case 19:
                    result = _b.sent();
                    newValues_1 = deepClone(result[0]);
                    valuesRef.current = newValues_1;
                    setTouched(function (prev) {
                        return Object.fromEntries(Object.keys(prev).map(function (field) { return [field, false]; }));
                    });
                    return [4 /*yield*/, Promise.all(Object.values(postSubmitHandlers.current).map(function (handler) {
                            return handler(newValues_1.id, params);
                        }))];
                case 20:
                    _b.sent();
                    // re-render after post submit handler, this way we avoid mounting new components before the form is fully saved
                    setValues(newValues_1);
                    if (!onSubmit) return [3 /*break*/, 22];
                    return [4 /*yield*/, onSubmit(newValues_1, submitValues, oldValues)];
                case 21:
                    _b.sent();
                    _b.label = 22;
                case 22: return [3 /*break*/, 25];
                case 23:
                    e_3 = _b.sent();
                    // don't use this for validation errors
                    if (!throwIsWarning)
                        setUpdateError(e_3);
                    throw e_3;
                case 24:
                    setSubmittingForm(false);
                    return [7 /*endfinally*/];
                case 25: return [2 /*return*/];
            }
        });
    }); }, [
        serverData,
        defaultRecord,
        preSubmit,
        deleteOnSubmit,
        setFieldValue,
        onDeleted,
        deleteRecord,
        validateForm,
        nestedFormName,
        updateData,
        model,
        onlySubmitMounted,
        onlySubmitMountedBehaviour,
        mountedFields,
        id,
        onSubmit,
        pushDialog,
        t,
    ]);
    var handleSubmit = useCallback(function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        void submitForm();
    }, [submitForm]);
    // nested forms
    var parentFormContext = useContext(FormContext);
    if (nestedFormName && !parentFormContext)
        throw new Error("Nested form mode wanted, but no parent context found");
    // nested forms - loading
    useEffect(function () {
        if (!parentFormContext || !nestedFormName)
            return;
        var state = parentFormContext.getCustomState(nestedFormName);
        if (!state)
            return;
        valuesRef.current = state.values;
        setValues(state.values);
        setErrors(state.errors);
        setWarnings(state.warnings);
        setTouched(state.touched);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // nested forms - saving
    useEffect(function () {
        if (!parentFormContext || !nestedFormName)
            return;
        parentFormContext.setCustomState(nestedFormName, function () { return ({
            values: values,
            errors: errors,
            warnings: warnings,
            touched: touched,
        }); });
        return function () {
            // clear nested state if record was deleted
            if (!deleted)
                return;
            parentFormContext.setCustomState(nestedFormName, function () { return undefined; });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        values,
        errors,
        warnings,
        touched,
        parentFormContext === null || parentFormContext === void 0 ? void 0 : parentFormContext.setCustomState,
        nestedFormName,
        deleted,
    ]);
    // nested forms - dirty state
    useEffect(function () {
        if (!parentFormContext || !nestedFormName)
            return;
        parentFormContext.setCustomFieldDirty(nestedFormName, dirty);
        return function () {
            if (parentFormContext.onlySubmitMounted && !disableNestedSubmit) {
                parentFormContext.setCustomFieldDirty(nestedFormName, false);
            }
        };
    }, [dirty, disableNestedSubmit, nestedFormName, parentFormContext]);
    // nested forms - submitting blocker
    useEffect(function () {
        if (!parentFormContext || !nestedFormName || !submittingBlocked)
            return;
        parentFormContext.addSubmittingBlocker(nestedFormName);
        return function () {
            parentFormContext.removeSubmittingBlocker(nestedFormName);
        };
    }, [nestedFormName, parentFormContext, submittingBlocked]);
    // nested forms - validation and submit hook
    useEffect(function () {
        if (!parentFormContext || !nestedFormName)
            return;
        var validateNestedForm = function () {
            setTouched(function (prev) {
                return Object.fromEntries(Object.keys(prev).map(function (field) { return [field, true]; }));
            });
            return validateForm("normal");
        };
        var validateNestedFormWarn = function () {
            setTouched(function (prev) {
                return Object.fromEntries(Object.keys(prev).map(function (field) { return [field, true]; }));
            });
            return validateForm("hint");
        };
        var submitNestedForm = function (id, params) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!nestedFormPreSubmitHandler) return [3 /*break*/, 2];
                        return [4 /*yield*/, nestedFormPreSubmitHandler(id, model)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, submitForm(params)];
                    case 3:
                        _a.sent();
                        parentFormContext.setCustomFieldDirty(nestedFormName, false);
                        return [2 /*return*/];
                }
            });
        }); };
        if (!disableNestedSubmit) {
            parentFormContext.setCustomValidationHandler(nestedFormName, validateNestedForm);
            parentFormContext.setCustomWarningHandler(nestedFormName, validateNestedFormWarn);
            parentFormContext.setPostSubmitHandler(nestedFormName, submitNestedForm);
        }
        return function () {
            if (parentFormContext.onlyValidateMounted ||
                onlySubmitNestedIfMounted ||
                disableValidation ||
                disableNestedSubmit) {
                parentFormContext.removeCustomValidationHandler(nestedFormName);
                parentFormContext.removeCustomWarningHandler(nestedFormName);
            }
            if (parentFormContext.onlySubmitMounted ||
                onlySubmitNestedIfMounted ||
                disableNestedSubmit)
                parentFormContext.removePostSubmitHandler(nestedFormName);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        parentFormContext === null || parentFormContext === void 0 ? void 0 : parentFormContext.setCustomValidationHandler,
        parentFormContext === null || parentFormContext === void 0 ? void 0 : parentFormContext.setCustomWarningHandler,
        parentFormContext === null || parentFormContext === void 0 ? void 0 : parentFormContext.onlyValidateMounted,
        parentFormContext === null || parentFormContext === void 0 ? void 0 : parentFormContext.onlySubmitMounted,
        parentFormContext === null || parentFormContext === void 0 ? void 0 : parentFormContext.setCustomFieldDirty,
        validateForm,
        disableValidation,
        nestedFormPreSubmitHandler,
        submitForm,
        nestedFormName,
        disableNestedSubmit,
        onlySubmitNestedIfMounted,
    ]);
    // Debug Helper (for React Devtools)
    useCallback(function (onlyDirty) {
        /* eslint-disable no-console */
        if (!serverData) {
            console.log("Can't determine Dirty State, No server data present");
            return;
        }
        if (!defaultRecord) {
            console.log("Can't determine Dirty State, No default data present");
            return;
        }
        // normalize data
        var localData = normalizeValues(values, {
            ignoreFields: dirtyIgnoreFields,
            model: model,
            defaultRecord: defaultRecord[0],
            onlySubmitMountedBehaviour: onlySubmitMountedBehaviour,
            onlySubmitMounted: onlySubmitMounted !== null && onlySubmitMounted !== void 0 ? onlySubmitMounted : false,
            mountedFields: mountedFields,
        });
        var remoteData = normalizeValues(serverData[0], {
            ignoreFields: dirtyIgnoreFields,
            model: model,
            defaultRecord: defaultRecord[0],
            onlySubmitMountedBehaviour: onlySubmitMountedBehaviour,
            onlySubmitMounted: onlySubmitMounted !== null && onlySubmitMounted !== void 0 ? onlySubmitMounted : false,
            mountedFields: mountedFields,
        });
        console.log("Form Dirty Flag State:");
        console.log("Form Dirty State (exact):", JSON.stringify(localData) !== JSON.stringify(remoteData));
        console.log("Form Dirty State:", JSON.stringify(localData) !== JSON.stringify(remoteData));
        console.log("Custom Dirty State:", customDirty);
        console.log("Custom Dirty Fields:", customDirtyFields);
        console.log("Custom Dirty Counter:", customDirtyCounter);
        console.log("Server Data:", remoteData);
        console.log("Form Data:", localData);
        Object.keys(localData).forEach(function (key) {
            var server = remoteData[key];
            var form = localData[key];
            var dirty = JSON.stringify(server) !== JSON.stringify(form);
            if (onlyDirty && !dirty)
                return;
            console.log("Dirty[", key, "]: ByRef:", server !== form, "ByJSON:", dirty);
        });
        /* eslint-enable no-console */
    }, [
        serverData,
        defaultRecord,
        values,
        dirtyIgnoreFields,
        model,
        onlySubmitMountedBehaviour,
        onlySubmitMounted,
        mountedFields,
        customDirty,
        customDirtyFields,
        customDirtyCounter,
    ]);
    // context and rendering
    var Children = useMemo(function () { return React.memo(children); }, [children]);
    var setError = useCallback(function (error) {
        setUpdateError(error);
    }, [setUpdateError]);
    var formContextData = useMemo(function () { return ({
        id: id,
        model: model,
        errorComponent: ErrorComponent,
        relations: serverData && serverData[1] ? serverData[1] : {},
        setError: setError,
        markFieldMounted: markFieldMounted,
        setCustomDirtyCounter: setCustomDirtyCounter,
        setCustomFieldDirty: setCustomFieldDirty,
        dirty: dirty,
        getCustomState: getCustomState,
        setCustomState: setCustomState,
        setPreSubmitHandler: setPreSubmitHandler,
        removePreSubmitHandler: removePreSubmitHandler,
        setPostSubmitHandler: setPostSubmitHandler,
        removePostSubmitHandler: removePostSubmitHandler,
        setCustomValidationHandler: setCustomValidationHandler,
        removeCustomValidationHandler: removeCustomValidationHandler,
        setCustomWarningHandler: setCustomWarningHandler,
        removeCustomWarningHandler: removeCustomWarningHandler,
        onlySubmitMounted: !!onlySubmitMounted,
        onlySubmitMountedBehaviour: onlySubmitMountedBehaviour,
        onlyValidateMounted: !!onlyValidateMounted,
        onlyWarnMounted: !!onlyWarnMounted,
        submitting: submitting,
        addSubmittingBlocker: addSubmittingBlocker,
        removeSubmittingBlocker: removeSubmittingBlocker,
        submit: submitForm,
        deleteOnSubmit: !!deleteOnSubmit,
        values: values,
        initialValues: serverData ? serverData[0] : {},
        touched: touched,
        errors: errors,
        warnings: warnings,
        setFieldValue: setFieldValue,
        setFieldValueLite: setFieldValueLite,
        setFieldTouchedLite: setFieldTouchedLite,
        getFieldValue: getFieldValue,
        getFieldValues: getFieldValues,
        handleBlur: handleBlur,
        setFieldTouched: setFieldTouched,
        resetForm: resetForm,
        refetchForm: refetch,
        validateForm: validateForm,
        parentFormContext: nestedFormName ? parentFormContext : null,
        customProps: customProps,
        readOnly: !!readOnly,
        readOnlyReason: readOnlyReason,
    }); }, [
        id,
        model,
        ErrorComponent,
        serverData,
        setError,
        markFieldMounted,
        dirty,
        getCustomState,
        setCustomState,
        setCustomFieldDirty,
        setPreSubmitHandler,
        removePreSubmitHandler,
        setPostSubmitHandler,
        removePostSubmitHandler,
        setCustomValidationHandler,
        removeCustomValidationHandler,
        setCustomWarningHandler,
        removeCustomWarningHandler,
        onlySubmitMounted,
        onlySubmitMountedBehaviour,
        onlyValidateMounted,
        onlyWarnMounted,
        deleteOnSubmit,
        submitting,
        addSubmittingBlocker,
        removeSubmittingBlocker,
        submitForm,
        values,
        touched,
        errors,
        warnings,
        setFieldValue,
        setFieldValueLite,
        setFieldTouchedLite,
        getFieldValue,
        getFieldValues,
        handleBlur,
        setFieldTouched,
        resetForm,
        refetch,
        validateForm,
        parentFormContext,
        nestedFormName,
        customProps,
        readOnly,
        readOnlyReason,
    ]);
    var formContextDataLite = useMemo(function () { return ({
        id: id,
        model: model,
        errorComponent: ErrorComponent,
        onlySubmitMounted: !!onlySubmitMounted,
        onlyValidateMounted: !!onlyValidateMounted,
        onlyWarnMounted: !!onlyWarnMounted,
        readOnly: !!readOnly,
        readOnlyReason: readOnlyReason,
        getFieldValue: getFieldValue,
        getFieldValues: getFieldValues,
        setFieldValueLite: setFieldValueLite,
        setFieldTouchedLite: setFieldTouchedLite,
    }); }, [
        id,
        model,
        ErrorComponent,
        onlySubmitMounted,
        onlyValidateMounted,
        onlyWarnMounted,
        readOnly,
        readOnlyReason,
        getFieldValue,
        getFieldValues,
        setFieldValueLite,
        setFieldTouchedLite,
    ]);
    if (error) {
        return React.createElement(Typography, { color: "error" }, error.message);
    }
    if (isLoading || isDefaultRecordLoading || isObjectEmpty(values)) {
        return React.createElement(Loader, null);
    }
    var displayError = defaultRecordError || updateError;
    if (!serverData || serverData.length !== 2 || isObjectEmpty(serverData[0])) {
        // eslint-disable-next-line no-console
        console.error("[Components-Care] [FormEngine] Data is faulty", serverData ? JSON.stringify(serverData, undefined, 4) : null);
        throw new Error("Data is not present, this should never happen");
    }
    var innerForm = function () { return (React.createElement(React.Fragment, null,
        displayError && !nestedFormName && (React.createElement(ErrorComponent, { error: displayError })),
        isLoading ? (React.createElement("div", { style: loaderContainerStyles },
            React.createElement(Loader, null))) : (React.createElement(Children, { isSubmitting: submitting, values: props.renderConditionally ? values : undefined, submit: submitForm, reset: resetForm, dirty: dirty, id: id, customProps: customProps, disableRouting: !!props.disableRouting })))); };
    return (React.createElement(FormContextLite.Provider, { value: formContextDataLite },
        React.createElement(FormContext.Provider, { value: formContextData }, !parentFormContext ? (React.createElement("form", { onSubmit: handleSubmit, className: formClass }, innerForm())) : (React.createElement("div", { className: formClass }, innerForm())))));
};
export default React.memo(Form);
