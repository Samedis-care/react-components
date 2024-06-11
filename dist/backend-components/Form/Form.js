import React, { useCallback, useContext, useEffect, useMemo, useRef, useState, } from "react";
import { useModelDelete, useModelGet, useModelMutation, } from "../../backend-integration/Model/Model";
import Loader from "../../standalone/Loader";
import { dotInObject, dotSet, dotsToObject, dotToObject, getValueByDot, } from "../../utils/dotUtils";
import deepAssign from "../../utils/deepAssign";
import deepClone from "../../utils/deepClone";
import isObjectEmpty from "../../utils/isObjectEmpty";
import { Grid, Typography } from "@mui/material";
import { getVisibility } from "../../backend-integration/Model/Visibility";
import { showConfirmDialogBool } from "../../non-standalone";
import useCCTranslations from "../../utils/useCCTranslations";
import { useDialogContext } from "../../framework";
import deepSort from "../../utils/deepSort";
import useDevKeybinds from "../../utils/useDevKeybinds";
// optional import
let captureException = null;
import("@sentry/react")
    .then((Sentry) => (captureException = Sentry.captureException))
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .catch(() => { }); // ignore
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
export const FormContext = React.createContext(null);
export const useFormContext = () => {
    const ctx = useContext(FormContext);
    if (!ctx)
        throw new Error("Form Context not set. Not using form engine?");
    return ctx;
};
export const FormContextLite = React.createContext(null);
export const useFormContextLite = () => {
    const ctx = useContext(FormContextLite);
    if (!ctx)
        throw new Error("Form Context (Lite) not set. Not using form engine?");
    return ctx;
};
const loaderContainerStyles = {
    height: 320,
    width: 320,
    margin: "auto",
};
const getUpdateData = (values, model, onlySubmitMounted, onlySubmitMountedBehaviour, alwaysSubmitFields, mountedFields, defaultRecord, id) => {
    const isMounted = (key) => key === "id" ||
        alwaysSubmitFields.includes(key) ||
        mountedFields[key] ||
        getVisibility(model.fields[key].visibility[id ? "edit" : "create"], values, values).hidden;
    const data = !onlySubmitMounted
        ? values
        : (() => {
            const result = {};
            const behaviour = onlySubmitMountedBehaviour;
            for (const field in model.fields) {
                const mounted = isMounted(field);
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
                    throw new Error(`Invalid onlySubmitMountedBehaviour ${behaviour}`);
                }
            }
            return dotsToObject(result);
        })();
    if (id === "singleton")
        return { ...data, id };
    return data;
};
/**
 * Normalizes data for validation to ensure dirty flag matches user perception
 * @param data The data to normalize
 * @param config The config
 */
const normalizeValues = (data, config) => {
    if (typeof data !== "object")
        throw new Error("Only Record<string, unknown> supported");
    const { ignoreFields, model, onlySubmitMounted, onlySubmitMountedBehaviour, alwaysSubmitFields, mountedFields, defaultRecord, } = config;
    data = getUpdateData(data, model, onlySubmitMounted, onlySubmitMountedBehaviour, alwaysSubmitFields, mountedFields, defaultRecord, data.id);
    let normalizedData = {};
    Object.entries(data).forEach(([k, v]) => {
        const shouldBeNulled = v === "" || (Array.isArray(v) && v.length === 0);
        normalizedData[k] = shouldBeNulled ? null : v;
    });
    if (ignoreFields) {
        ignoreFields.forEach((field) => {
            normalizedData = dotSet(field, normalizedData, null);
        });
    }
    return deepSort(normalizedData);
};
const setAllTouched = (touched, set) => Object.fromEntries(Object.keys(touched).map((field) => [field, set]));
const Form = (props) => {
    const { model, id, children, onSubmit, customProps, onlyWarnMounted, alwaysSubmitFields, onlyWarnChanged, readOnly: readOnlyProp, readOnlyReason: readOnlyReasonProp, readOnlyReasons: readOnlyReasonsProp, disableValidation, nestedFormName, disableNestedSubmit, nestedFormPreSubmitHandler, deleteOnSubmit, onDeleted, initialRecord, formClass, preSubmit, dirtyIgnoreFields, flowEngine, } = props;
    // flow engine mode defaults
    const onlyValidateMounted = flowEngine ? true : props.onlyValidateMounted;
    const onlySubmitNestedIfMounted = flowEngine
        ? false
        : props.onlySubmitNestedIfMounted;
    const onlySubmitMounted = flowEngine ? true : props.onlySubmitMounted;
    //
    const onlySubmitMountedBehaviour = props.onlySubmitMountedBehaviour ?? OnlySubmitMountedBehaviour.OMIT;
    const ErrorComponent = props.errorComponent;
    const { t } = useCCTranslations();
    const [pushDialog] = useDialogContext();
    // custom fields - dirty state
    // v1
    const [customDirtyCounter, setCustomDirtyCounter] = useState(0);
    // v2
    const [customDirtyFields, setCustomDirtyFields] = useState([]);
    const setCustomFieldDirty = useCallback((field, dirty) => {
        setCustomDirtyFields((prev) => {
            const prevDirty = prev.includes(field);
            if (prevDirty == dirty)
                return prev; // no changes
            if (dirty)
                return [...prev, field];
            else
                return prev.filter((candidate) => candidate !== field);
        });
    }, []);
    const customDirty = customDirtyCounter > 0 || customDirtyFields.length > 0;
    // custom fields - pre submit handlers
    const preSubmitHandlers = useRef({});
    const setPreSubmitHandler = useCallback((field, handler) => {
        preSubmitHandlers.current[field] = handler;
    }, []);
    const removePreSubmitHandler = useCallback((field) => {
        delete preSubmitHandlers.current[field];
    }, []);
    // custom fields - custom validation handlers
    const customValidationHandlers = useRef({});
    const setCustomValidationHandler = useCallback((field, handler) => {
        customValidationHandlers.current[field] = handler;
    }, []);
    const removeCustomValidationHandler = useCallback((field) => {
        delete customValidationHandlers.current[field];
    }, []);
    // custom fields - custom warning handlers
    const customWarningHandlers = useRef({});
    const setCustomWarningHandler = useCallback((field, handler) => {
        customWarningHandlers.current[field] = handler;
    }, []);
    const removeCustomWarningHandler = useCallback((field) => {
        delete customWarningHandlers.current[field];
    }, []);
    // custom fields - post submit handlers
    const postSubmitHandlers = useRef({});
    const setPostSubmitHandler = useCallback((field, handler) => {
        postSubmitHandlers.current[field] = handler;
    }, []);
    const removePostSubmitHandler = useCallback((field) => {
        delete postSubmitHandlers.current[field];
    }, []);
    // custom fields - state
    const customFieldState = useRef({});
    const getCustomState = useCallback((field) => customFieldState.current[field], []);
    const setCustomState = useCallback((field, value) => {
        customFieldState.current[field] =
            typeof value === "function"
                ? value(customFieldState.current[field])
                : value;
    }, []);
    // custom read-only
    const [customReadOnlyReasons, setCustomReadOnlyReasons] = useState({});
    const setCustomReadOnly = useCallback((ident, reason) => {
        setCustomReadOnlyReasons((prev) => {
            return {
                ...prev,
                [ident]: reason ?? null,
            };
        });
    }, []);
    const removeCustomReadOnly = useCallback((ident) => {
        setCustomReadOnlyReasons((prev) => {
            const newReaons = { ...prev };
            delete newReaons[ident];
            return newReaons;
        });
    }, []);
    // main form handling
    const [deleted, setDeleted] = useState(false);
    useEffect(() => {
        // clear deleted state upon id change
        setDeleted(false);
    }, [id]);
    const { isLoading, error, data: serverData, refetch, } = useModelGet(model, deleted ? null : id || null);
    const { mutateAsync: updateData } = useModelMutation(model);
    const { mutateAsync: deleteRecord } = useModelDelete(model);
    const { isLoading: isDefaultRecordLoading, data: defaultRecord, error: defaultRecordError, } = useModelGet(model, null);
    const getDefaultTouched = useCallback(() => Object.fromEntries(Object.keys(model.fields).map((key) => [key, false])), [model]);
    const [updateError, setUpdateError] = useState(null);
    const valuesStagedRef = useRef({});
    const [valuesStaged, setValuesStaged] = useState({});
    const valuesStagedModifiedRef = useRef({});
    const [valuesStagedModified, setValuesStagedModified] = useState({});
    const valuesRef = useRef({});
    const [values, setValues] = useState({});
    const touchedRef = useRef({});
    const [touched, setTouched] = useState({});
    const [errors, setErrors] = useState({});
    const [warnings, setWarnings] = useState({});
    const [submittingForm, setSubmittingForm] = useState(false);
    const [submittingOther, setSubmittingOther] = useState([]);
    const removeBusyReason = useCallback((name) => {
        setSubmittingOther((prev) => prev.filter((e) => e !== name));
    }, []);
    const addBusyReason = useCallback((name, promise) => {
        setSubmittingOther((prev) => [...prev, name]);
        if (promise)
            void promise.finally(() => removeBusyReason(name));
    }, [removeBusyReason]);
    const [submittingBlocked, setSubmittingBlocked] = useState(false);
    const [submittingBlocker, setSubmittingBlocker] = useState([]);
    const addSubmittingBlocker = useCallback((name) => {
        setSubmittingBlocker((prev) => [...prev, name]);
    }, []);
    const removeSubmittingBlocker = useCallback((name) => {
        setSubmittingBlocker((prev) => prev.filter((entry) => entry !== name));
    }, []);
    const submitting = (submittingForm || submittingOther.length > 0) &&
        !submittingBlocked &&
        submittingBlocker.length === 0;
    // main form handling - read-only
    const readOnlyReasons = useMemo(() => {
        const legacy = readOnlyProp
            ? { "form-legacy": readOnlyReasonProp ?? null }
            : {};
        const submitReadOnly = submitting
            ? {
                submit: t("backend-components.form.read-only.submitting") ?? null,
            }
            : {};
        return {
            ...legacy,
            ...submitReadOnly,
            ...readOnlyReasonsProp,
            ...customReadOnlyReasons,
        };
    }, [
        readOnlyProp,
        readOnlyReasonProp,
        readOnlyReasonsProp,
        customReadOnlyReasons,
        submitting,
        t,
    ]);
    const readOnly = !isObjectEmpty(readOnlyReasons);
    // main form handling - validation disable toggle
    useEffect(() => {
        if (!disableValidation)
            return;
        setErrors({});
        setWarnings({});
    }, [disableValidation]);
    // main form handling - mounted state tracking
    const [mountedFields, setMountedFields] = useState(() => Object.fromEntries(Object.keys(model.fields).map((field) => [field, false])));
    const markFieldMounted = useCallback((field, mounted) => {
        setMountedFields((prev) => ({ ...prev, [field]: mounted }));
    }, []);
    // main form handling - dirty state
    const getNormalizedData = useCallback((values) => {
        if (!serverData) {
            throw new Error("No server data");
        }
        if (!defaultRecord) {
            throw new Error("No default record");
        }
        const localData = normalizeValues(values ?? valuesRef.current, {
            ignoreFields: dirtyIgnoreFields,
            model: model,
            defaultRecord: defaultRecord[0],
            onlySubmitMountedBehaviour,
            onlySubmitMounted: onlySubmitMounted ?? false,
            alwaysSubmitFields: alwaysSubmitFields ?? [],
            mountedFields,
        });
        const remoteData = normalizeValues(serverData[0], {
            ignoreFields: dirtyIgnoreFields,
            model: model,
            defaultRecord: defaultRecord[0],
            onlySubmitMountedBehaviour,
            onlySubmitMounted: onlySubmitMounted ?? false,
            alwaysSubmitFields: alwaysSubmitFields ?? [],
            mountedFields,
        });
        return [localData, remoteData];
    }, [
        defaultRecord,
        dirtyIgnoreFields,
        model,
        mountedFields,
        onlySubmitMounted,
        onlySubmitMountedBehaviour,
        alwaysSubmitFields,
        serverData,
    ]);
    const getFormDirty = useCallback((values) => serverData && defaultRecord
        ? (() => {
            const [local, remote] = getNormalizedData(values);
            return JSON.stringify(local) !== JSON.stringify(remote);
        })()
        : false, [serverData, defaultRecord, getNormalizedData]);
    const formDirty = useMemo(() => getFormDirty(values), [getFormDirty, values]);
    const getDirty = useCallback((formDirty) => formDirty || customDirty || !!(id && !deleted && deleteOnSubmit), [customDirty, deleteOnSubmit, deleted, id]);
    const dirty = getDirty(formDirty);
    // main form handling - dispatch
    const validateForm = useCallback(async (mode = "normal", values) => {
        if (disableValidation)
            return {};
        let fieldsToValidate = Object.keys(model.fields);
        if (onlyValidateMounted || (mode === "hint" && onlyWarnMounted)) {
            fieldsToValidate = fieldsToValidate.filter((field) => field in mountedFields && mountedFields[field]);
        }
        if (mode === "hint" && onlyWarnChanged) {
            const [localData, remoteData] = getNormalizedData(values);
            fieldsToValidate = fieldsToValidate.filter((field) => JSON.stringify(getValueByDot(field, localData)) !==
                JSON.stringify(getValueByDot(field, remoteData)));
        }
        const errors = await model.validate(values ?? valuesRef.current, id ? "edit" : "create", fieldsToValidate, mode);
        await Promise.all(Object.entries(mode === "normal"
            ? customValidationHandlers.current
            : customWarningHandlers.current).map(async ([name, handler]) => {
            const customErrors = await handler();
            for (const key in customErrors) {
                if (!Object.prototype.hasOwnProperty.call(customErrors, key))
                    continue;
                errors[name + "_" + key] = customErrors[key];
            }
        }));
        return errors;
    }, [
        disableValidation,
        model,
        onlyValidateMounted,
        onlyWarnMounted,
        onlyWarnChanged,
        id,
        mountedFields,
        getNormalizedData,
    ]);
    const validateField = useCallback(async (field, value) => {
        const values = value !== undefined
            ? deepAssign({}, valuesRef.current, dotToObject(field, value))
            : undefined;
        const errors = await validateForm("normal", values);
        const warnings = await validateForm("hint", values);
        setErrors(errors);
        setWarnings(warnings);
    }, [validateForm]);
    const setFieldTouchedLite = useCallback((field, newTouched = false) => {
        if (touchedRef.current[field] !== newTouched) {
            touchedRef.current = { ...touchedRef.current, [field]: newTouched };
            setTouched(touchedRef.current);
        }
    }, []);
    const setFieldTouched = useCallback((field, newTouched = true, validate = false) => {
        setFieldTouchedLite(field, newTouched);
        if (validate)
            void validateField(field);
    }, [setFieldTouchedLite, validateField]);
    const getFieldValue = useCallback((field) => {
        return getValueByDot(field, valuesRef.current);
    }, []);
    const getFieldValues = useCallback(() => {
        return valuesRef.current;
    }, []);
    const setFieldValue = useCallback((field, value, validate = true, triggerOnChange = false) => {
        if (triggerOnChange) {
            const onChange = model.fields[field].onChange;
            if (onChange) {
                value = onChange(value, model, setFieldValue, getFieldValue);
                if (value === undefined && process.env.NODE_ENV === "development") {
                    // eslint-disable-next-line no-console
                    console.error(`[Components-Care] [Form] onChange handler for field '${field}' returned undefined. Missing return?`);
                }
            }
        }
        setFieldTouched(field, true, false);
        valuesRef.current = dotSet(field, valuesRef.current, value);
        setValues(valuesRef.current);
        if (validate)
            void validateField(field, value);
    }, [setFieldTouched, validateField, model, getFieldValue]);
    const setFieldValueLite = useCallback((field, value) => {
        setFieldTouchedLite(field, true);
        valuesRef.current = dotSet(field, valuesRef.current, value);
        setValues(valuesRef.current);
    }, [setFieldTouchedLite]);
    const resetForm = useCallback(() => {
        if (!serverData || !serverData[0])
            return;
        valuesRef.current = deepClone(serverData[0]);
        setValues(valuesRef.current);
        valuesStagedRef.current = deepClone(serverData[0]);
        setValuesStaged(valuesStagedRef.current);
    }, [serverData]);
    const handleBlur = useCallback((evt) => {
        const fieldName = evt.currentTarget?.name ??
            evt.currentTarget?.getAttribute("data-name") ??
            evt.currentTarget?.id ??
            evt.target?.name ??
            evt.target?.getAttribute("data-name") ??
            evt.target?.id;
        if (!fieldName) {
            // eslint-disable-next-line no-console
            console.error("[Components-Care] [Form] Handling on blur event for element without name. Please set form name via one of these attributes: name, data-name or id", evt);
            return;
        }
        setFieldTouched(fieldName);
    }, [setFieldTouched]);
    // init data structs after first load
    useEffect(() => {
        if (isLoading || !serverData || !serverData[0])
            return;
        valuesRef.current = deepClone(serverData[0]);
        setValues(valuesRef.current);
        touchedRef.current = getDefaultTouched();
        setTouched(touchedRef.current);
        if (initialRecord && id == null) {
            void Promise.all(Object.keys(model.fields)
                .filter((key) => dotInObject(key, initialRecord))
                .map((key) => setFieldValue(key, getValueByDot(key, initialRecord), false)));
        }
        valuesStagedRef.current = deepClone(valuesRef.current);
        setValuesStaged(valuesStagedRef.current);
        valuesStagedModifiedRef.current = deepClone(touchedRef.current);
        setValuesStagedModified(valuesStagedModifiedRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading]);
    // update data struct after background fetch
    useEffect(() => {
        if (isLoading || !serverData || !serverData[0])
            return;
        const serverRecord = deepClone(serverData[0]);
        const updateUnmodified = (data, modifiedValues) => {
            const newValues = deepClone(data);
            const untouchedFields = Object.entries(modifiedValues)
                .filter(([, modified]) => !modified)
                .map(([field]) => field);
            untouchedFields
                .filter((field) => dotInObject(field, serverRecord))
                .forEach((field) => {
                deepAssign(newValues, dotToObject(field, getValueByDot(field, serverRecord)));
            });
            return newValues;
        };
        valuesRef.current = updateUnmodified(valuesRef.current, touched);
        valuesStagedRef.current = updateUnmodified(valuesStagedRef.current, valuesStagedModifiedRef.current);
        setValues(valuesRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverData]);
    // main form - submit handler
    const submitForm = useCallback(async (params) => {
        if (!serverData)
            throw new Error("serverData is null"); // should never happen
        if (!defaultRecord)
            throw new Error("default record is null"); // should never happen
        if (!getDirty(getFormDirty(valuesRef.current)))
            return; // when form isn't dirty we don't have to submit
        if (params && "nativeEvent" in params)
            params = undefined;
        if (!params)
            params = {};
        if (preSubmit) {
            let cancelSubmit;
            try {
                cancelSubmit = await preSubmit({
                    serverData: (serverData && serverData[0]) ?? valuesRef.current,
                    formData: valuesRef.current,
                    submitOptions: params,
                    deleteOnSubmit: !!deleteOnSubmit,
                    setFieldValue,
                });
            }
            catch (e) {
                if (captureException)
                    captureException(e);
                // eslint-disable-next-line no-console
                console.error("[Components-Care] [FormEngine] Pre-submit handler threw exception", e);
                cancelSubmit = true;
            }
            if (cancelSubmit) {
                return;
            }
        }
        setSubmittingForm(true);
        touchedRef.current = setAllTouched(touchedRef.current, true);
        setTouched(touchedRef.current);
        if (deleteOnSubmit) {
            try {
                const id = valuesRef.current.id;
                if (id) {
                    setDeleted(true);
                    await deleteRecord(id);
                }
                if (onDeleted)
                    onDeleted(id);
            }
            catch (e) {
                setDeleted(false);
                if (e instanceof Error) {
                    setUpdateError(e);
                }
                throw e;
            }
            finally {
                setSubmittingForm(false);
            }
            return;
        }
        let throwIsWarning = false;
        try {
            const validationHints = await validateForm("hint");
            setWarnings(validationHints);
            const validation = await validateForm("normal");
            setErrors(validation);
            if (!isObjectEmpty(validation)) {
                // noinspection ExceptionCaughtLocallyJS
                throw validation;
            }
            if (!isObjectEmpty(validationHints) &&
                !params.ignoreWarnings &&
                !nestedFormName) {
                setSubmittingBlocked(true);
                const continueSubmit = await showConfirmDialogBool(pushDialog, {
                    title: t("backend-components.form.submit-with-warnings.title"),
                    message: (React.createElement(Grid, { container: true, spacing: 2 },
                        React.createElement(Grid, { item: true, xs: 12 }, t("backend-components.form.submit-with-warnings.message")),
                        React.createElement(Grid, { item: true, xs: 12 },
                            React.createElement("ul", null, Object.entries(validationHints).map(([key, value]) => (React.createElement("li", { key: key }, value))))))),
                    textButtonYes: t("backend-components.form.submit-with-warnings.yes"),
                    textButtonNo: t("backend-components.form.submit-with-warnings.no"),
                });
                setSubmittingBlocked(false);
                if (!continueSubmit) {
                    throwIsWarning = true;
                    // noinspection ExceptionCaughtLocallyJS
                    throw validationHints;
                }
            }
            await Promise.all(Object.values(preSubmitHandlers.current).map((handler) => handler(id, params)));
            if (flowEngine) {
                // flow engine staged submit
                const updateData = getUpdateData(valuesRef.current, model, true, OnlySubmitMountedBehaviour.OMIT, alwaysSubmitFields ?? [], mountedFields, defaultRecord[0], id);
                const originalStaged = deepClone(valuesStagedRef.current);
                valuesStagedRef.current = deepAssign(valuesStagedRef.current, updateData);
                setValuesStaged(valuesStagedRef.current);
                valuesStagedModifiedRef.current = Object.fromEntries(Object.entries(valuesStagedModifiedRef.current).map(([key, modified]) => [
                    key,
                    modified ||
                        getValueByDot(key, originalStaged) !==
                            getValueByDot(key, valuesStagedRef.current),
                ]));
                setValuesStagedModified(valuesStagedModifiedRef.current);
                touchedRef.current = setAllTouched(touchedRef.current, false);
                setTouched(touchedRef.current);
                valuesRef.current = deepClone(valuesStagedRef.current);
                setValues(valuesRef.current);
            }
            if (!flowEngine || params.submitToServer) {
                const submitValues = valuesRef.current;
                const oldValues = serverData[0];
                const result = await updateData(getUpdateData(flowEngine ? valuesStagedRef.current : valuesRef.current, model, flowEngine && id === null ? false : onlySubmitMounted ?? false, onlySubmitMountedBehaviour, alwaysSubmitFields ?? [], flowEngine ? valuesStagedModifiedRef.current : mountedFields, defaultRecord[0], id));
                const newValues = deepClone(result[0]);
                valuesRef.current = newValues;
                valuesStagedRef.current = deepClone(result[0]);
                touchedRef.current = setAllTouched(touchedRef.current, false);
                setTouched(touchedRef.current);
                valuesStagedModifiedRef.current = setAllTouched(valuesStagedModifiedRef.current, false);
                setValuesStagedModified(valuesStagedModifiedRef.current);
                await Promise.all(Object.values(postSubmitHandlers.current).map((handler) => handler(newValues.id, params)));
                // re-render after post submit handler, this way we avoid mounting new components before the form is fully saved
                setValues(newValues);
                setValuesStaged(valuesStagedRef.current);
                if (onSubmit) {
                    await onSubmit(newValues, submitValues, oldValues);
                }
            }
        }
        catch (e) {
            // don't use this for validation errors
            if (!throwIsWarning)
                setUpdateError(e);
            throw e;
        }
        finally {
            setSubmittingForm(false);
        }
    }, [
        serverData,
        defaultRecord,
        getDirty,
        getFormDirty,
        preSubmit,
        deleteOnSubmit,
        setFieldValue,
        onDeleted,
        deleteRecord,
        validateForm,
        nestedFormName,
        flowEngine,
        pushDialog,
        t,
        id,
        updateData,
        model,
        onlySubmitMounted,
        onlySubmitMountedBehaviour,
        alwaysSubmitFields,
        mountedFields,
        onSubmit,
    ]);
    const handleSubmit = useCallback((evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        void submitForm();
    }, [submitForm]);
    // nested forms
    const parentFormContext = useContext(FormContext);
    if (nestedFormName && !parentFormContext)
        throw new Error("Nested form mode wanted, but no parent context found");
    // nested forms - loading
    useEffect(() => {
        if (!parentFormContext || !nestedFormName)
            return;
        const state = parentFormContext.getCustomState(nestedFormName);
        if (!state)
            return;
        valuesRef.current = state.values;
        setValues(state.values);
        setErrors(state.errors);
        setWarnings(state.warnings);
        setTouched(state.touched);
        valuesStagedRef.current = state.valuesStaged;
        setValuesStaged(state.valuesStaged);
        valuesStagedModifiedRef.current = state.valuesStagedModified;
        setValuesStagedModified(state.valuesStagedModified);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // nested forms - saving
    useEffect(() => {
        if (!parentFormContext || !nestedFormName)
            return;
        parentFormContext.setCustomState(nestedFormName, () => ({
            values,
            errors,
            warnings,
            touched,
            valuesStaged,
            valuesStagedModified,
        }));
        return () => {
            // clear nested state if record was deleted
            if (!deleted)
                return;
            parentFormContext.setCustomState(nestedFormName, () => undefined);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        values,
        errors,
        warnings,
        touched,
        parentFormContext?.setCustomState,
        nestedFormName,
        deleted,
    ]);
    // nested forms - dirty state
    useEffect(() => {
        if (!parentFormContext || !nestedFormName)
            return;
        parentFormContext.setCustomFieldDirty(nestedFormName, dirty);
        return () => {
            if (parentFormContext.onlySubmitMounted && !disableNestedSubmit) {
                parentFormContext.setCustomFieldDirty(nestedFormName, false);
            }
        };
    }, [dirty, disableNestedSubmit, nestedFormName, parentFormContext]);
    // nested forms - submitting blocker
    useEffect(() => {
        if (!parentFormContext || !nestedFormName || !submittingBlocked)
            return;
        parentFormContext.addSubmittingBlocker(nestedFormName);
        return () => {
            parentFormContext.removeSubmittingBlocker(nestedFormName);
        };
    }, [nestedFormName, parentFormContext, submittingBlocked]);
    // nested forms - validation and submit hook
    useEffect(() => {
        if (!parentFormContext || !nestedFormName)
            return;
        const validateNestedForm = () => {
            touchedRef.current = setAllTouched(touchedRef.current, true);
            setTouched(touchedRef.current);
            return validateForm("normal");
        };
        const validateNestedFormWarn = () => {
            touchedRef.current = setAllTouched(touchedRef.current, true);
            setTouched(touchedRef.current);
            return validateForm("hint");
        };
        const submitNestedForm = async (id, params) => {
            if (nestedFormPreSubmitHandler) {
                await nestedFormPreSubmitHandler(id, model, getFieldValue, setFieldValueLite);
            }
            await submitForm(params);
            parentFormContext.setCustomFieldDirty(nestedFormName, false);
        };
        if (!disableNestedSubmit) {
            parentFormContext.setCustomValidationHandler(nestedFormName, validateNestedForm);
            parentFormContext.setCustomWarningHandler(nestedFormName, validateNestedFormWarn);
            parentFormContext.setPostSubmitHandler(nestedFormName, submitNestedForm);
        }
        return () => {
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
        parentFormContext?.setCustomValidationHandler,
        parentFormContext?.setCustomWarningHandler,
        parentFormContext?.onlyValidateMounted,
        parentFormContext?.onlySubmitMounted,
        parentFormContext?.setCustomFieldDirty,
        validateForm,
        disableValidation,
        nestedFormPreSubmitHandler,
        submitForm,
        nestedFormName,
        disableNestedSubmit,
        onlySubmitNestedIfMounted,
    ]);
    // Debug Helper (for React Devtools)
    const debugDirty = useCallback((onlyDirty) => {
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
        const [localData, remoteData] = getNormalizedData();
        console.log("Form Dirty Flag State:");
        console.log("Form Dirty State (exact):", JSON.stringify(localData) !== JSON.stringify(remoteData));
        console.log("Form Dirty State:", JSON.stringify(localData) !== JSON.stringify(remoteData));
        console.log("Custom Dirty State:", customDirty);
        console.log("Custom Dirty Fields:", customDirtyFields);
        console.log("Custom Dirty Counter:", customDirtyCounter);
        console.log("Server Data:", remoteData);
        console.log("Form Data:", localData);
        console.log("Staged Data:", valuesStagedRef.current);
        Object.keys(model.fields).forEach((key) => {
            const server = getValueByDot(key, remoteData);
            const form = getValueByDot(key, localData);
            const dirty = JSON.stringify(server) !== JSON.stringify(form);
            if (onlyDirty && !dirty)
                return;
            console.log("Dirty[", key, "]: ByRef:", server !== form, "ByJSON:", dirty);
        });
        /* eslint-enable no-console */
    }, [
        serverData,
        defaultRecord,
        getNormalizedData,
        customDirty,
        customDirtyFields,
        customDirtyCounter,
        model.fields,
    ]);
    useDevKeybinds(useMemo(() => ({ "ccform dirty?": () => debugDirty(true) }), [debugDirty]));
    // context and rendering
    const Children = useMemo(() => React.memo(children), [children]);
    const setError = useCallback((error) => {
        setUpdateError(error);
    }, [setUpdateError]);
    const formContextData = useMemo(() => ({
        id,
        model: model,
        errorComponent: ErrorComponent,
        relations: serverData && serverData[1] ? serverData[1] : {},
        setError,
        markFieldMounted,
        setCustomDirtyCounter,
        setCustomFieldDirty,
        dirty,
        getCustomState,
        setCustomState,
        setPreSubmitHandler,
        removePreSubmitHandler,
        setPostSubmitHandler,
        removePostSubmitHandler,
        setCustomValidationHandler,
        removeCustomValidationHandler,
        setCustomWarningHandler,
        removeCustomWarningHandler,
        setCustomReadOnly,
        removeCustomReadOnly,
        onlySubmitMounted: !!onlySubmitMounted,
        onlySubmitMountedBehaviour,
        onlyValidateMounted: !!onlyValidateMounted,
        onlyWarnMounted: !!onlyWarnMounted,
        onlyWarnChanged: !!onlyWarnChanged,
        submitting,
        addBusyReason,
        removeBusyReason,
        addSubmittingBlocker,
        removeSubmittingBlocker,
        submit: submitForm,
        deleteOnSubmit: !!deleteOnSubmit,
        values,
        initialValues: serverData ? serverData[0] : {},
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
        refetchForm: refetch,
        validateForm,
        parentFormContext: nestedFormName ? parentFormContext : null,
        customProps,
        readOnly: readOnly,
        readOnlyReason: readOnlyReasons[0],
        readOnlyReasons: readOnlyReasons,
        flowEngine: !!flowEngine,
    }), [
        id,
        model,
        ErrorComponent,
        serverData,
        setError,
        markFieldMounted,
        setCustomFieldDirty,
        dirty,
        getCustomState,
        setCustomState,
        setPreSubmitHandler,
        removePreSubmitHandler,
        setPostSubmitHandler,
        removePostSubmitHandler,
        setCustomValidationHandler,
        removeCustomValidationHandler,
        setCustomWarningHandler,
        removeCustomWarningHandler,
        setCustomReadOnly,
        removeCustomReadOnly,
        onlySubmitMounted,
        onlySubmitMountedBehaviour,
        onlyValidateMounted,
        onlyWarnMounted,
        onlyWarnChanged,
        submitting,
        addBusyReason,
        removeBusyReason,
        addSubmittingBlocker,
        removeSubmittingBlocker,
        submitForm,
        deleteOnSubmit,
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
        nestedFormName,
        parentFormContext,
        customProps,
        readOnly,
        readOnlyReasons,
        flowEngine,
    ]);
    const formContextDataLite = useMemo(() => ({
        id,
        model: model,
        customProps,
        errorComponent: ErrorComponent,
        onlySubmitMounted: !!onlySubmitMounted,
        onlyValidateMounted: !!onlyValidateMounted,
        onlyWarnMounted: !!onlyWarnMounted,
        onlyWarnChanged: !!onlyWarnChanged,
        readOnly: readOnly,
        readOnlyReason: readOnlyReasons[0],
        readOnlyReasons: readOnlyReasons,
        getFieldValue,
        getFieldValues,
        setFieldValueLite,
        setFieldTouchedLite,
        setCustomReadOnly,
        removeCustomReadOnly,
        flowEngine: !!flowEngine,
        submit: submitForm,
        submitting,
        dirty,
    }), [
        id,
        model,
        customProps,
        ErrorComponent,
        onlySubmitMounted,
        onlyValidateMounted,
        onlyWarnMounted,
        onlyWarnChanged,
        setCustomReadOnly,
        removeCustomReadOnly,
        readOnly,
        readOnlyReasons,
        getFieldValue,
        getFieldValues,
        setFieldValueLite,
        setFieldTouchedLite,
        flowEngine,
        submitForm,
        submitting,
        dirty,
    ]);
    if (error) {
        return React.createElement(Typography, { color: "error" }, error.message);
    }
    if (isLoading || isDefaultRecordLoading || isObjectEmpty(values)) {
        return React.createElement(Loader, null);
    }
    const displayError = defaultRecordError || updateError;
    if (!serverData || serverData.length !== 2 || isObjectEmpty(serverData[0])) {
        // eslint-disable-next-line no-console
        console.error("[Components-Care] [FormEngine] Data is faulty", serverData ? JSON.stringify(serverData, undefined, 4) : null);
        throw new Error("Data is not present, this should never happen");
    }
    const innerForm = () => (React.createElement(React.Fragment, null,
        displayError && !nestedFormName && (React.createElement(ErrorComponent, { error: displayError })),
        isLoading ? (React.createElement("div", { style: loaderContainerStyles },
            React.createElement(Loader, null))) : (React.createElement(Children, { isSubmitting: submitting, values: props.renderConditionally ? values : undefined, submit: submitForm, reset: resetForm, dirty: dirty, id: id, customProps: customProps, disableRouting: !!props.disableRouting }))));
    return (React.createElement(FormContextLite.Provider, { value: formContextDataLite },
        React.createElement(FormContext.Provider, { value: formContextData }, !parentFormContext ? (React.createElement("form", { onSubmit: handleSubmit, className: formClass }, innerForm())) : (React.createElement("div", { className: formClass }, innerForm())))));
};
export default React.memo(Form);
