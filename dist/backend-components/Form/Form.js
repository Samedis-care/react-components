import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState, } from "react";
import { useModelDelete, useModelGet, useModelMutation, } from "../../backend-integration/Model/Model";
import Loader from "../../standalone/Loader";
import { dotInObject, dotSet, dotsToObject, dotToObject, getValueByDot, } from "../../utils/dotUtils";
import deepAssign from "../../utils/deepAssign";
import deepClone from "../../utils/deepClone";
import isObjectEmpty from "../../utils/isObjectEmpty";
import { Grid, styled, Typography } from "@mui/material";
import { getVisibility } from "../../backend-integration/Model/Visibility";
import { showConfirmDialogBool } from "../../non-standalone";
import useCCTranslations from "../../utils/useCCTranslations";
import { useDialogContext } from "../../framework";
import deepSort from "../../utils/deepSort";
import useDevKeybinds from "../../utils/useDevKeybinds";
import useRefState from "../../utils/useRefState";
import uniqueArray from "../../utils/uniqueArray";
import { hashKey } from "@tanstack/react-query";
import ValidationError from "./ValidationError";
import TypedEventTarget from "../../utils/TypedEventTarget";
import { DirtyStateContext, NO_DIRTY_STATE } from "./DirtyStateContext";
import useFormPageGuard, { FormPageGuardContext } from "./FormPageGuard";
import deepEqual from "../../utils/deepEqual";
import toComparisonJson from "../../utils/toComparisonJson";
import { captureError } from "../../framework/ErrorReporting";
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
export const FormRenderAsDivContext = React.createContext(false);
/**
 * The key of FormContextData.readOnlyReasons under which a form is read-only while it
 * submits or is busy (FormContextData.submitting), with the text "The form is currently
 * being saved". Any other key means the form is read-only for another reason.
 */
export const FORM_SUBMITTING_READ_ONLY_REASON = "submit";
/**
 * Context which stores information about the current form so it can be used by fields
 */
export const FormContext = React.createContext(null);
/**
 * The context of the form this component is rendered in
 * @typeParam M The model of the form (required), ModelUnknown for code that works with any form
 * @typeParam CustomPropsT The custom props of the form
 * @remarks M is not checked against the model the form actually uses
 */
export const useFormContext = (
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- only there to require M
..._modelTypeRequired) => {
    const ctx = useContext(FormContext);
    if (!ctx)
        throw new Error("Form Context not set. Not using form engine?");
    return ctx;
};
export const FormContextLite = React.createContext(null);
/**
 * The lite context of the form this component is rendered in
 * @see useFormContext
 */
export const useFormContextLite = (
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- only there to require M
..._modelTypeRequired) => {
    const ctx = useContext(FormContextLite);
    if (!ctx)
        throw new Error("Form Context (Lite) not set. Not using form engine?");
    return ctx;
};
export const useFormFlowEngineStageConfig = (config) => {
    const { flowEngineConfig } = useFormContextLite();
    useEffect(() => {
        flowEngineConfig.current = config;
        return () => {
            flowEngineConfig.current = {};
        };
    }, [config, flowEngineConfig]);
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
const StyledForm = styled("form", { name: "CcForm", slot: "root" })({});
const StyledFormDiv = styled("div", { name: "CcForm", slot: "root" })({});
/**
 * Types data of the form engine as a record of the form's model: the deserialized server data
 * and the values built from it
 */
const asModelRecord = (data) => data;
/**
 * Does a custom field hold changes that count toward the given flag?
 * @param fields The custom fields that hold changes
 * @param flowEngine Is the form a flow form? Without it "staged" counts toward dirty
 * @param staged true: the flag stagedDirty, false: the flag dirty
 */
const hasCustomDirty = (fields, flowEngine, staged) => Object.values(fields).some((state) => (flowEngine && state === "staged") === staged);
const Form = (props) => {
    const { model: formModel, id, children, onSubmit, onSubmitUserInteractive, customProps, onlyWarnMounted, onlyWarnChanged, readOnly: readOnlyProp, readOnlyReason: readOnlyReasonProp, readOnlyReasons: readOnlyReasonsProp, disableValidation, nestedFormName, disableNestedSubmit, nestedSubmitBeforeParent, nestedFormPreSubmitHandler, deleteOnSubmit, onDeleted, initialRecord, formClass, preSubmit, dirtyIgnoreFields, showDirtyState, flowEngine, renderFormAsDiv: renderFormAsDivProp, errorRenderer: ErrorRenderer, } = props;
    // the form engine itself works with any model, the typing is for the props and the context
    const model = formModel;
    const renderFormAsDiv = useContext(FormRenderAsDivContext) || renderFormAsDivProp;
    // flow engine mode defaults
    const flowEngineConfig = useRef({});
    const onlyValidateMounted = flowEngine ? true : props.onlyValidateMounted;
    const onlySubmitNestedIfMounted = flowEngine
        ? false
        : props.onlySubmitNestedIfMounted;
    const onlySubmitMounted = flowEngine
        ? (flowEngineConfig.current.onlySubmitMounted ?? true)
        : props.onlySubmitMounted;
    //
    const onlySubmitMountedBehaviour = flowEngineConfig.current.onlySubmitMountedBehaviour ??
        props.onlySubmitMountedBehaviour ??
        OnlySubmitMountedBehaviour.OMIT;
    const ErrorComponent = props.errorComponent;
    const { t } = useCCTranslations();
    const [pushDialog] = useDialogContext();
    // form engine events
    // a ref rather than a useMemo: useMemo is a cache React is free to discard, and a
    // fresh event target would silently drop every listener registered so far. Assigning
    // lazily keeps re-renders from allocating one just to throw it away.
    const formEventsRef = useRef(null);
    if (!formEventsRef.current) {
        formEventsRef.current = new TypedEventTarget();
    }
    const formEvents = formEventsRef.current;
    // custom fields - dirty state
    const { get: getCustomDirtyFields, set: setCustomDirtyFields, state: customDirtyFields, } = useRefState({});
    // setCustomFieldDirty lives further down, next to the dirty state events it announces
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
    const hasCustomState = useCallback((field) => Object.prototype.hasOwnProperty.call(customFieldState.current, field), []);
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
    const { get: getDeleted, set: setDeleted, state: deleted, } = useRefState(false);
    useEffect(() => {
        // clear deleted state upon id change
        setDeleted(false);
    }, [id, setDeleted]);
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
    const prevServerDataRef = useRef(null);
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
                [FORM_SUBMITTING_READ_ONLY_REASON]: t("backend-components.form.read-only.submitting") ?? null,
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
    const { get: getInitialValues, set: setInitialValues, state: initialValuesState, } = useRefState(undefined);
    // the dirty baseline is the server record: for a new record (a record without an id) the
    // model's default record. It is a copy, as the server data is the react-query cache entry
    // that every create form of the model starts from
    useEffect(() => {
        setInitialValues(serverData ? deepClone(serverData[0]) : undefined);
    }, [serverData, setInitialValues]);
    // the values a record's form starts with: the server record, plus initialRecord for a new
    // record. initialRecord is a change to the new record, not a part of its baseline, so the
    // fields it sets to other values than the model's defaults make the form dirty.
    // initialRecord is applied when the server data loads, not when it changes: the form
    // data was seeded from it then
    const initialRecordRef = useRef(initialRecord);
    initialRecordRef.current = initialRecord;
    const seedValues = useCallback((data) => deepAssign(deepClone(data), data.id || !initialRecordRef.current ? {} : initialRecordRef.current), []);
    const alwaysSubmitFields = useMemo(() => uniqueArray([
        ...(props.alwaysSubmitFields ?? []),
        ...(flowEngineConfig.current.alwaysSubmitFields ?? []),
    ]), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.alwaysSubmitFields, flowEngineConfig.current.alwaysSubmitFields]);
    /**
     * Normalizes the values and the baseline for the dirty comparison
     * @param values The values (defaults to the current values)
     * @param initialValuesOverride The baseline (defaults to initialValues)
     * @param countedFields The fields that count as mounted for onlySubmitMounted
     *                      (defaults to the mounted fields)
     * @returns The normalized values and the normalized baseline
     */
    const getNormalizedData = useCallback((values, initialValuesOverride, countedFields) => {
        const initialValues = initialValuesOverride ?? getInitialValues();
        if (!initialValues) {
            throw new Error("No server data (initialValues)");
        }
        if (!defaultRecord) {
            throw new Error("No default record");
        }
        const localData = normalizeValues(values ?? valuesRef.current, {
            ignoreFields: dirtyIgnoreFields,
            model,
            defaultRecord: defaultRecord[0],
            onlySubmitMountedBehaviour,
            onlySubmitMounted: onlySubmitMounted ?? false,
            alwaysSubmitFields,
            mountedFields: countedFields ?? mountedFields,
        });
        const remoteData = normalizeValues(initialValues, {
            ignoreFields: dirtyIgnoreFields,
            model,
            defaultRecord: defaultRecord[0],
            onlySubmitMountedBehaviour,
            onlySubmitMounted: onlySubmitMounted ?? false,
            alwaysSubmitFields,
            mountedFields: countedFields ?? mountedFields,
        });
        return [localData, remoteData];
    }, [
        getInitialValues,
        defaultRecord,
        dirtyIgnoreFields,
        model,
        onlySubmitMountedBehaviour,
        onlySubmitMounted,
        alwaysSubmitFields,
        mountedFields,
    ]);
    const getFormDirty = useCallback((values) => 
    // getNormalizedData needs both the baseline and the default record; the
    // two load independently, so guard against defaultRecord not being ready
    initialValuesState && defaultRecord
        ? (() => {
            const [local, remote] = getNormalizedData(values);
            return toComparisonJson(local) !== toComparisonJson(remote);
        })()
        : false, [initialValuesState, defaultRecord, getNormalizedData]);
    /**
     * Computes per-field dirty state (value differs from the given baseline).
     * @param values The current form values to check
     * @param baseline The baseline to compare against (defaults to initialValues)
     * @param countedFields The fields that count as mounted for onlySubmitMounted
     *                      (defaults to the mounted fields)
     * @returns A map of field name to modified (true) / unmodified (false)
     */
    const getDirtyFields = useCallback((values, baseline, countedFields) => {
        const initialValues = baseline ?? getInitialValues();
        // getNormalizedData needs both the baseline and the default record; if
        // either isn't available yet nothing has been modified (first load)
        if (!initialValues || !defaultRecord) {
            return Object.fromEntries(Object.keys(model.fields).map((field) => [field, false]));
        }
        const [localData, remoteData] = getNormalizedData(values, initialValues, countedFields);
        return Object.fromEntries(Object.keys(model.fields).map((field) => [
            field,
            toComparisonJson(getValueByDot(field, localData)) !==
                toComparisonJson(getValueByDot(field, remoteData)),
        ]));
    }, [getNormalizedData, getInitialValues, defaultRecord, model.fields]);
    const formDirty = useMemo(() => getFormDirty(values), [getFormDirty, values]);
    /**
     * @see FormContextData.dirtyFields
     */
    const dirtyFields = useMemo(
    // the baseline is passed as the state rather than left to getDirtyFields'
    // getInitialValues() ref read, so that replacing it — after a save, or a
    // refetch — actually recomputes the map
    () => getDirtyFields(values, initialValuesState), [getDirtyFields, values, initialValuesState]);
    const getDirty = useCallback((formDirty) => formDirty ||
        hasCustomDirty(getCustomDirtyFields(), !!flowEngine, false) ||
        !!(id && !getDeleted() && deleteOnSubmit), [getCustomDirtyFields, flowEngine, getDeleted, deleteOnSubmit, id]);
    const dirty = getDirty(formDirty);
    /**
     * Do the staged values differ from the baseline, or does a custom field hold staged
     * changes? Compares the fields the flow's save sends, as the save picks them: those a
     * stage staged as modified, alwaysSubmitFields and hidden fields, every field of a new
     * record
     * @param staged The staged values
     * @param stagedModified The fields a stage staged as modified
     * @param baseline The server record (initialValues), undefined before it loaded
     * @param customFields The custom fields that hold changes
     * @returns false without flowEngine; before the baseline and the default record loaded
     *          only a custom field counts
     * @see FormContextData.stagedDirty
     */
    const getStagedDirty = useCallback((staged, stagedModified, baseline, customFields) => {
        if (!flowEngine)
            return false;
        if (hasCustomDirty(customFields, true, true))
            return true;
        if (!baseline || !defaultRecord)
            return false;
        const config = {
            ignoreFields: dirtyIgnoreFields,
            model,
            defaultRecord: defaultRecord[0],
            onlySubmitMountedBehaviour,
            onlySubmitMounted: id === null ? false : (onlySubmitMounted ?? false),
            alwaysSubmitFields,
            mountedFields: stagedModified,
        };
        return (toComparisonJson(normalizeValues(staged, config)) !==
            toComparisonJson(normalizeValues(baseline, config)));
    }, [
        flowEngine,
        defaultRecord,
        dirtyIgnoreFields,
        model,
        onlySubmitMountedBehaviour,
        id,
        onlySubmitMounted,
        alwaysSubmitFields,
    ]);
    /**
     * @see FormContextData.stagedDirty
     */
    const stagedDirty = useMemo(
    // the baseline and the custom fields are passed as the state, like for dirtyFields, so
    // that replacing them (after a save, a refetch, a custom field's change) recomputes it
    () => getStagedDirty(valuesStaged, valuesStagedModified, initialValuesState, customDirtyFields), [
        getStagedDirty,
        valuesStaged,
        valuesStagedModified,
        initialValuesState,
        customDirtyFields,
    ]);
    // main form handling - dirty state events
    // dirty is derived from state, so a listener relying on the rendered flag only learns
    // about a change one render late. That's too late for "submit, then navigate away":
    // the form is clean the moment submit resolves, but React hasn't re-rendered yet.
    // So the last dispatched value is kept in a ref and compared against the freshly
    // computed one, which lets the form engine announce the change right when it happens.
    const dispatchedDirtyRef = useRef(null);
    const dispatchDirtyEvent = useCallback((dirty, stagedDirty) => {
        const dispatched = dispatchedDirtyRef.current;
        if (dispatched &&
            dispatched.dirty === dirty &&
            dispatched.stagedDirty === stagedDirty)
            return;
        const event = { dirty, stagedDirty };
        dispatchedDirtyRef.current = event;
        formEvents.dispatchEvent("dirty", event);
    }, [formEvents]);
    /**
     * Recomputes the dirty state (dirty and stagedDirty) from the refs and dispatches the
     * dirty event if it changed
     * @remarks Call this after synchronously mutating values/staged values/initial values, to
     *          notify listeners without waiting for the re-render.
     */
    const syncDirtyState = useCallback(() => {
        dispatchDirtyEvent(getDirty(getFormDirty(valuesRef.current)), getStagedDirty(valuesStagedRef.current, valuesStagedModifiedRef.current, getInitialValues(), getCustomDirtyFields()));
    }, [
        dispatchDirtyEvent,
        getDirty,
        getFormDirty,
        getStagedDirty,
        getInitialValues,
        getCustomDirtyFields,
    ]);
    // catch-all for every dirty change that isn't announced by an explicit syncDirtyState
    useEffect(() => {
        dispatchDirtyEvent(dirty, stagedDirty);
    }, [dirty, stagedDirty, dispatchDirtyEvent]);
    // syncDirtyState changes with the dirty baseline (initial values, mounted fields, a flow
    // stage's alwaysSubmitFields), setCustomFieldDirty must not
    const syncDirtyStateRef = useRef(syncDirtyState);
    syncDirtyStateRef.current = syncDirtyState;
    /**
     * @see FormContextData.setCustomFieldDirty
     */
    const setCustomFieldDirty = useCallback((field, dirty) => {
        setCustomDirtyFields((prev) => {
            const prevDirty = Object.prototype.hasOwnProperty.call(prev, field)
                ? prev[field]
                : false;
            if (prevDirty === dirty)
                return prev; // no changes
            const next = { ...prev };
            if (dirty)
                next[field] = dirty;
            else
                delete next[field];
            return next;
        });
        // a custom field is the one dirty source the form engine doesn't compute itself,
        // so announce it here - a caller which clears its field and then navigates away
        // must not be stopped by the render which hasn't happened yet
        syncDirtyStateRef.current();
    }, [setCustomDirtyFields]);
    // main form handling - dispatch
    const alwaysWarnFields = useMemo(() => (props.alwaysWarnFields ?? []).concat(flowEngineConfig.current.alwaysWarnFields ?? []), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.alwaysSubmitFields, flowEngineConfig.current.alwaysWarnFields]);
    const validateForm = useCallback(async (mode = "normal", valuesOverride) => {
        const values = valuesOverride ?? valuesRef.current;
        if (disableValidation)
            return {};
        let fieldsToValidate = Object.keys(model.fields);
        if (onlyValidateMounted || (mode === "hint" && onlyWarnMounted)) {
            fieldsToValidate = fieldsToValidate.filter((field) => (field in mountedFields && mountedFields[field]) ||
                alwaysSubmitFields.includes(field));
        }
        if (mode === "hint" && onlyWarnChanged) {
            const [localData, remoteData] = getNormalizedData(values);
            fieldsToValidate = fieldsToValidate.filter((field) => alwaysWarnFields.includes(field) ||
                toComparisonJson(getValueByDot(field, localData)) !==
                    toComparisonJson(getValueByDot(field, remoteData)));
        }
        const errors = await model.validate(values, id ? "edit" : "create", fieldsToValidate, mode);
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
        alwaysSubmitFields,
        getNormalizedData,
        alwaysWarnFields,
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
            const fieldDef = model.fields[field];
            if (fieldDef.onChange) {
                value = fieldDef.onChange(value, model, setFieldValue, getFieldValue);
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
        syncDirtyState();
    }, [serverData, syncDirtyState]);
    const handleBlur = useCallback((evt) => {
        // an input's name and every element's id are "" when not set: an empty
        // value names nothing, so the search goes on to the next attribute and on
        // to the element that lost focus (e.g. the input inside a wrapper)
        const fieldName = evt.currentTarget?.name ||
            evt.currentTarget?.getAttribute("data-name") ||
            evt.currentTarget?.id ||
            evt.target?.name ||
            evt.target?.getAttribute("data-name") ||
            evt.target?.id;
        if (!fieldName) {
            // eslint-disable-next-line no-console
            console.error("[Components-Care] [Form] Handling on blur event for element without name. Please set form name via one of these attributes: name, data-name or id", evt);
            return;
        }
        setFieldTouched(fieldName);
    }, [setFieldTouched]);
    // whether the form data was initialized from the current load. React may run the
    // init effect again without a new load and with all state kept (StrictMode when a
    // Suspense boundary shows the form again, Activity when it shows a hidden subtree):
    // that must keep what was entered, only the next load initializes again
    const initializedRef = useRef(false);
    // the server data the form data was last updated from. A re-run of the refetch effect
    // below with the same data (see initializedRef) has nothing to apply, and must not take
    // fields of a flow engine stage that is no longer mounted for unmodified ones
    const appliedServerDataRef = useRef(undefined);
    // the record the form data belongs to: its model, by query key (a model object created
    // again for the same data is the same model), and its id. Another record starts the form
    // over, as on a fresh mount: the page shows the loader for a render, so it is mounted
    // again, and the init effect below fills the form from the new record. The id a create
    // form is given for the record it has just saved is that same record
    const modelKey = useMemo(() => hashKey(model.getReactQueryKey(null, false)), [model]);
    const recordId = id || null;
    const [dataRecord, setDataRecord] = useState({ modelKey, id: recordId });
    const recordChanged = dataRecord.modelKey !== modelKey || dataRecord.id !== recordId;
    const recordSwitched = recordChanged &&
        !(dataRecord.modelKey === modelKey &&
            dataRecord.id === null &&
            recordId !== null &&
            values.id === recordId);
    useEffect(() => {
        if (!recordChanged)
            return;
        setDataRecord({ modelKey, id: recordId });
        if (!recordSwitched)
            return;
        initializedRef.current = false;
        prevServerDataRef.current = null;
        appliedServerDataRef.current = undefined;
        customFieldState.current = {};
        // the previous page has unmounted by now. What it left registered (the save or the
        // validation of a hidden control or nested form) belongs to the previous record; the
        // page mounted for the new record registers its own
        preSubmitHandlers.current = {};
        postSubmitHandlers.current = {};
        customValidationHandlers.current = {};
        customWarningHandlers.current = {};
        setCustomDirtyFields({});
        setErrors({});
        setWarnings({});
        setUpdateError(null);
    }, [recordChanged, recordSwitched, modelKey, recordId, setCustomDirtyFields]);
    // init data structs after a load, or after a switch to another record (which may be
    // cached, then nothing loads)
    useEffect(() => {
        if (isLoading) {
            initializedRef.current = false;
            return;
        }
        if (initializedRef.current || !serverData || !serverData[0])
            return;
        initializedRef.current = true;
        valuesRef.current = deepClone(seedValues(serverData[0]));
        setValues(valuesRef.current);
        touchedRef.current = getDefaultTouched();
        setTouched(touchedRef.current);
        valuesStagedRef.current = deepClone(valuesRef.current);
        setValuesStaged(valuesStagedRef.current);
        valuesStagedModifiedRef.current = deepClone(touchedRef.current);
        setValuesStagedModified(valuesStagedModifiedRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading, serverData]);
    // update data struct after background fetch
    useEffect(() => {
        if (isLoading || !serverData || !serverData[0])
            return;
        if (appliedServerDataRef.current === serverData)
            return;
        appliedServerDataRef.current = serverData;
        const serverRecord = deepClone(serverData[0]);
        // the very first load is fully handled by the init effect above (including
        // initialRecord); only record the baseline so later refetches can diff
        if (!prevServerDataRef.current) {
            prevServerDataRef.current = serverRecord;
            return;
        }
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
        const combineModified = (...modified) => {
            const arrays = modified
                .map((t) => Object.entries(t))
                .flat();
            const fieldKeys = arrays.map((arr) => arr[0]);
            const combined = Object.fromEntries(fieldKeys.map((field) => [field, false]));
            arrays.forEach(([field, isModified]) => {
                if (isModified)
                    combined[field] = true;
            });
            return combined;
        };
        // decide which fields to update from server data based on per-field dirty
        // state (value differs from the previous server data), not touched state.
        // The staged values count wherever the flow's save sends them (the staged
        // modified fields), also when the stage that staged them is no longer shown
        const baseline = prevServerDataRef.current;
        const mainDirty = getDirtyFields(valuesRef.current, baseline);
        const stagedDirty = getDirtyFields(valuesStagedRef.current, baseline, flowEngine
            ? combineModified(mountedFields, valuesStagedModifiedRef.current)
            : undefined);
        valuesRef.current = updateUnmodified(valuesRef.current, flowEngine ? combineModified(stagedDirty, mainDirty) : mainDirty);
        valuesStagedRef.current = updateUnmodified(valuesStagedRef.current, stagedDirty);
        setValues(valuesRef.current);
        setValuesStaged(valuesStagedRef.current);
        prevServerDataRef.current = serverRecord;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverData]);
    // main form - submit handler
    const submitForm = useCallback(async (params) => {
        if (params && "nativeEvent" in params)
            params = undefined;
        if (!params)
            params = {};
        if (!serverData)
            throw new Error("serverData is null"); // should never happen
        if (!defaultRecord)
            throw new Error("default record is null"); // should never happen
        if (!getDirty(getFormDirty(valuesRef.current)) &&
            !flowEngine &&
            !params.ignoreDirtyCheck)
            return; // when form isn't dirty we don't have to submit unless it's flow engine and nothing has changed yet (to trigger validations)
        if (preSubmit) {
            let cancelSubmit;
            try {
                cancelSubmit = await preSubmit({
                    serverData: asModelRecord((serverData && serverData[0]) ?? valuesRef.current),
                    formData: asModelRecord(valuesRef.current),
                    submitOptions: params,
                    deleteOnSubmit: !!deleteOnSubmit,
                    setFieldValue,
                });
            }
            catch (e) {
                captureError(e, { source: "FormEngine.preSubmit" });
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
                // the record is gone, so there is nothing left to save. Announce it before
                // handing over control, so onDeleted can navigate away without being blocked
                syncDirtyState();
                if (onDeleted)
                    onDeleted(id);
            }
            catch (e) {
                setDeleted(false);
                if (e instanceof Error) {
                    setUpdateError(e);
                }
                if (!nestedFormName)
                    captureError(e, {
                        source: "FormEngine.submitDelete",
                        extra: { modelId: model.modelId, recordId: id },
                    });
                throw e;
            }
            finally {
                setSubmittingForm(false);
                // whatever happened above (including the rollback in catch), listeners
                // leave this call knowing the real dirty state
                syncDirtyState();
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
                throw new ValidationError("error", validation);
            }
            if (!isObjectEmpty(validationHints) &&
                !params.ignoreWarnings &&
                !nestedFormName) {
                setSubmittingBlocked(true);
                const continueSubmit = await showConfirmDialogBool(pushDialog, {
                    title: t("backend-components.form.submit-with-warnings.title"),
                    message: (_jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { size: 12, children: t("backend-components.form.submit-with-warnings.message") }), _jsx(Grid, { size: 12, children: _jsx("ul", { children: Object.entries(validationHints).map(([key, value]) => (_jsx("li", { children: value }, key))) }) })] })),
                    textButtonYes: t("backend-components.form.submit-with-warnings.yes"),
                    textButtonNo: t("backend-components.form.submit-with-warnings.no"),
                });
                setSubmittingBlocked(false);
                if (!continueSubmit) {
                    throwIsWarning = true;
                    // noinspection ExceptionCaughtLocallyJS
                    throw new ValidationError("warn", validationHints);
                }
            }
            await Promise.all(Object.values(preSubmitHandlers.current).map((handler) => Promise.resolve(handler(id, params))));
            if (flowEngine) {
                // flow engine staged submit
                const updateData = getUpdateData(valuesRef.current, model, flowEngineConfig.current.onlySubmitMounted ?? true, flowEngineConfig.current.onlySubmitMountedBehaviour ??
                    OnlySubmitMountedBehaviour.OMIT, alwaysSubmitFields, mountedFields, defaultRecord[0], id);
                const originalStaged = deepClone(valuesStagedRef.current);
                for (const field in model.fields) {
                    if (!dotInObject(field, updateData))
                        continue;
                    const value = getValueByDot(field, updateData);
                    valuesStagedRef.current = dotSet(field, valuesStagedRef.current, value);
                }
                setValuesStaged(valuesStagedRef.current);
                valuesStagedModifiedRef.current = Object.fromEntries(Object.entries(valuesStagedModifiedRef.current).map(([key, modified]) => [
                    key,
                    modified ||
                        !deepEqual(getValueByDot(key, originalStaged), getValueByDot(key, valuesStagedRef.current)),
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
                const result = await updateData(getUpdateData(flowEngine ? valuesStagedRef.current : valuesRef.current, model, flowEngine && id === null ? false : (onlySubmitMounted ?? false), onlySubmitMountedBehaviour, alwaysSubmitFields, flowEngine ? valuesStagedModifiedRef.current : mountedFields, defaultRecord[0], id));
                const newValues = deepClone(result[0]);
                valuesRef.current = newValues;
                valuesStagedRef.current = deepClone(result[0]);
                setInitialValues(deepClone(result[0]));
                touchedRef.current = setAllTouched(touchedRef.current, false);
                setTouched(touchedRef.current);
                valuesStagedModifiedRef.current = setAllTouched(valuesStagedModifiedRef.current, false);
                setValuesStagedModified(valuesStagedModifiedRef.current);
                await Promise.all(Object.values(postSubmitHandlers.current).map((handler) => Promise.resolve(handler(newValues.id, params))));
                // re-render after post submit handler, this way we avoid mounting new components before the form is fully saved
                setValues(valuesRef.current);
                setValuesStaged(valuesStagedRef.current);
                // the record was saved, so its model fields are clean again. Announce it once
                // the post submit handlers have had their say, and before onSubmit, so it
                // (and the caller awaiting submit) can navigate away without hitting the
                // dirty guard. A custom dirty field counts until its control clears it; one
                // that does so in an effect catches up only once the save has rendered
                syncDirtyState();
                if (onSubmit) {
                    const interactive = typeof onSubmitUserInteractive === "function"
                        ? onSubmitUserInteractive(asModelRecord(newValues), asModelRecord(submitValues), asModelRecord(oldValues))
                        : onSubmitUserInteractive;
                    if (interactive)
                        setSubmittingForm(false);
                    await onSubmit(asModelRecord(newValues), asModelRecord(submitValues), asModelRecord(oldValues));
                    // setSubmittingForm(true); // disabled because this is the last thing that happens in this handler
                }
            }
        }
        catch (e) {
            // don't use this for validation errors
            if (!throwIsWarning)
                setUpdateError(e);
            // nested forms rethrow into the parent form's submit, which reports it there, so
            // reporting here as well would report the same error twice
            // note: ValidationErrors (including the "warn" one thrown when the user declines the
            // warnings dialog) are not reported, see DefaultUnreportedErrorNames
            if (!nestedFormName)
                captureError(e, {
                    source: "FormEngine.submit",
                    extra: { modelId: model.modelId, recordId: id },
                });
            throw e;
        }
        finally {
            setSubmittingForm(false);
            // catch-all for the paths which don't announce themselves, e.g. a flow
            // engine stage which only staged its values
            syncDirtyState();
        }
    }, [
        serverData,
        defaultRecord,
        getDirty,
        getFormDirty,
        flowEngine,
        preSubmit,
        deleteOnSubmit,
        setFieldValue,
        onDeleted,
        deleteRecord,
        validateForm,
        nestedFormName,
        pushDialog,
        t,
        id,
        model,
        alwaysSubmitFields,
        mountedFields,
        updateData,
        onlySubmitMounted,
        onlySubmitMountedBehaviour,
        setInitialValues,
        setDeleted,
        syncDirtyState,
        onSubmit,
        onSubmitUserInteractive,
    ]);
    const submitFormRef = useRef(submitForm);
    submitFormRef.current = submitForm;
    const submitFormReferenced = useCallback((p1) => {
        return submitFormRef.current(p1);
    }, []);
    const safeSubmitForm = useCallback(async (params) => {
        try {
            await submitFormRef.current(params);
            return true;
        }
        catch {
            // ignore, shown to user via ErrorComponent and reported via captureError in submitForm
            return false;
        }
    }, []);
    const handleSubmit = useCallback(async (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        await safeSubmitForm();
    }, [safeSubmitForm]);
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
        if (!isObjectEmpty(state.values)) {
            valuesRef.current = state.values;
            setValues(state.values);
            setErrors(state.errors);
            setWarnings(state.warnings);
            setTouched(state.touched);
        }
        if (!isObjectEmpty(state.valuesStaged)) {
            valuesStagedRef.current = state.valuesStaged;
            setValuesStaged(state.valuesStaged);
            valuesStagedModifiedRef.current = state.valuesStagedModified;
            setValuesStagedModified(state.valuesStagedModified);
        }
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
    // nested forms - staged by the parent's flow
    /**
     * Has a submit of the parent's flow staged this form's edits since the form mounted?
     * @remarks Set by every submit of a flow parent (goToStage makes one before it changes
     *          the stage), as it stages the values of the shown stage; cleared once this form
     *          saved
     */
    const nestedStagedRef = useRef(false);
    /**
     * What becomes of this form's edits when it unmounts, as of the latest render
     * @returns "staged": they wait for the save of the parent's flow, which staged them (its
     *          stage was left). "dropped": they are neither counted nor saved (the parent's
     *          onlySubmitMounted, onlySubmitNestedIfMounted, disableNestedSubmit). "kept": they
     *          keep the parent dirty and are saved by its save.
     * @see FormProps.nestedFormName
     */
    const nestedLeftOnUnmount = () => {
        if (disableNestedSubmit || onlySubmitNestedIfMounted)
            return "dropped";
        if (parentFormContext?.flowEngine && nestedStagedRef.current && dirty)
            return "staged";
        return parentFormContext?.onlySubmitMounted ? "dropped" : "kept";
    };
    // read when the form unmounts, which renders nothing more
    const nestedLeftOnUnmountRef = useRef(nestedLeftOnUnmount);
    nestedLeftOnUnmountRef.current = nestedLeftOnUnmount;
    // nested forms - dirty state
    useEffect(() => {
        if (!parentFormContext || !nestedFormName)
            return;
        // a nested form the parent doesn't submit has nothing the parent's save could save
        parentFormContext.setCustomFieldDirty(nestedFormName, dirty && !disableNestedSubmit);
        // parentFormContext omitted from deps: its identity changes often (formContextData useMemo), but setCustomFieldDirty is stable
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dirty, disableNestedSubmit, nestedFormName]);
    // what the form's unmount leaves of its dirty state, in one call: staged edits move from
    // the parent's dirty to its stagedDirty without the parent looking clean in between
    useEffect(() => {
        if (!parentFormContext || !nestedFormName)
            return;
        const { setCustomFieldDirty } = parentFormContext;
        return () => {
            const left = nestedLeftOnUnmountRef.current();
            if (left === "staged")
                setCustomFieldDirty(nestedFormName, "staged");
            else if (left === "dropped")
                setCustomFieldDirty(nestedFormName, false);
        };
        // setCustomFieldDirty is stable, see above
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nestedFormName]);
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
                await nestedFormPreSubmitHandler(id, formModel, getFieldValue, setFieldValueLite);
            }
            await submitForm(params);
            nestedStagedRef.current = false;
            parentFormContext.setCustomFieldDirty(nestedFormName, false);
        };
        const flowParent = parentFormContext.flowEngine;
        const preSubmitNestedForm = async (id, params) => {
            if (flowParent) {
                // a submit of the parent's flow stages the values of the shown stage, and this
                // form's edits with them. One that only stages sends nothing: the edits wait
                // for the flow's save
                nestedStagedRef.current = true;
                if (!params.submitToServer)
                    return;
            }
            if (nestedSubmitBeforeParent)
                await submitNestedForm(id, params);
        };
        const hasPreSubmitHandler = nestedSubmitBeforeParent || flowParent;
        if (!disableNestedSubmit) {
            parentFormContext.setCustomValidationHandler(nestedFormName, validateNestedForm);
            parentFormContext.setCustomWarningHandler(nestedFormName, validateNestedFormWarn);
            if (hasPreSubmitHandler) {
                parentFormContext.setPreSubmitHandler(nestedFormName, preSubmitNestedForm);
            }
            if (!nestedSubmitBeforeParent) {
                parentFormContext.setPostSubmitHandler(nestedFormName, submitNestedForm);
            }
        }
        return () => {
            if (parentFormContext.onlyValidateMounted ||
                onlySubmitNestedIfMounted ||
                disableValidation ||
                disableNestedSubmit) {
                parentFormContext.removeCustomValidationHandler(nestedFormName);
                parentFormContext.removeCustomWarningHandler(nestedFormName);
            }
            // staged edits are saved by the flow's save, also once the form unmounted
            if (nestedLeftOnUnmountRef.current() !== "staged" &&
                (parentFormContext.onlySubmitMounted ||
                    onlySubmitNestedIfMounted ||
                    disableNestedSubmit)) {
                if (hasPreSubmitHandler) {
                    parentFormContext.removePreSubmitHandler(nestedFormName);
                }
                if (!nestedSubmitBeforeParent) {
                    parentFormContext.removePostSubmitHandler(nestedFormName);
                }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        parentFormContext?.setCustomValidationHandler,
        parentFormContext?.setCustomWarningHandler,
        parentFormContext?.onlyValidateMounted,
        parentFormContext?.onlySubmitMounted,
        parentFormContext?.flowEngine,
        parentFormContext?.setCustomFieldDirty,
        validateForm,
        disableValidation,
        nestedFormPreSubmitHandler,
        submitForm,
        nestedFormName,
        disableNestedSubmit,
        nestedSubmitBeforeParent,
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
        console.log("Form Dirty State (exact):", toComparisonJson(localData) !== toComparisonJson(remoteData));
        console.log("Form Dirty State:", toComparisonJson(localData) !== toComparisonJson(remoteData));
        console.log("Custom Dirty State:", hasCustomDirty(getCustomDirtyFields(), !!flowEngine, false));
        console.log("Custom Dirty Fields:", getCustomDirtyFields());
        console.log("Staged Dirty State:", getStagedDirty(valuesStagedRef.current, valuesStagedModifiedRef.current, getInitialValues(), getCustomDirtyFields()));
        console.log("Server Data:", remoteData);
        console.log("Form Data:", localData);
        console.log("Staged Data:", valuesStagedRef.current);
        const dirtyFields = getDirtyFields(valuesRef.current);
        Object.keys(model.fields).forEach((key) => {
            const server = getValueByDot(key, remoteData);
            const form = getValueByDot(key, localData);
            const dirty = dirtyFields[key];
            if (onlyDirty && !dirty)
                return;
            console.log("Dirty[", key, "]: ByRef:", server !== form, "ByJSON:", dirty, "Value Server:", server, "Value Form:", form);
        });
        /* eslint-enable no-console */
    }, [
        serverData,
        defaultRecord,
        getNormalizedData,
        getDirtyFields,
        getCustomDirtyFields,
        flowEngine,
        getStagedDirty,
        getInitialValues,
        model.fields,
    ]);
    useDevKeybinds(useMemo(() => ({ "ccform dirty?": () => debugDirty(true) }), [debugDirty]));
    // the leave guard which the form pages switch on. The Form holds it, so it lasts as long
    // as the changes do, also while no form page is mounted (one in a routed tab panel when
    // another tab is open). A save makes the form read-only too, but its changes are unsaved
    // until it succeeds, so only a form which is read-only for another reason goes unguarded.
    // The changes are the shown values and, in flow mode, the staged ones.
    const pageGuard = useFormPageGuard({
        readOnlyBesidesSaving: Object.keys(readOnlyReasons).some((reason) => reason !== FORM_SUBMITTING_READ_ONLY_REASON),
        unsaved: dirty || stagedDirty,
        addEventListener: formEvents.addEventListener,
        removeEventListener: formEvents.removeEventListener,
    });
    // context and rendering
    const Children = useMemo(() => React.memo(children), [children]);
    const setError = useCallback((error) => {
        setUpdateError(error);
    }, [setUpdateError]);
    const formContextData = useMemo(() => ({
        id,
        model,
        errorComponent: ErrorComponent,
        relations: serverData && serverData[1] ? serverData[1] : {},
        setError,
        markFieldMounted,
        setCustomFieldDirty,
        dirty,
        stagedDirty,
        dirtyFields,
        showDirtyState: !!showDirtyState,
        getCustomState,
        setCustomState,
        hasCustomState,
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
        addEventListener: formEvents.addEventListener,
        removeEventListener: formEvents.removeEventListener,
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
        submit: submitFormReferenced,
        safeSubmit: safeSubmitForm,
        deleteOnSubmit: !!deleteOnSubmit,
        values,
        initialValues: initialValuesState ?? {},
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
        flowEngineConfig,
    }), [
        id,
        model,
        ErrorComponent,
        serverData,
        setError,
        markFieldMounted,
        setCustomFieldDirty,
        dirty,
        stagedDirty,
        dirtyFields,
        showDirtyState,
        getCustomState,
        setCustomState,
        hasCustomState,
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
        formEvents,
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
        submitFormReferenced,
        safeSubmitForm,
        deleteOnSubmit,
        values,
        initialValuesState,
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
        model,
        customProps,
        errorComponent: ErrorComponent,
        onlySubmitMounted: !!onlySubmitMounted,
        onlyValidateMounted: !!onlyValidateMounted,
        onlyWarnMounted: !!onlyWarnMounted,
        onlyWarnChanged: !!onlyWarnChanged,
        readOnly: readOnly,
        readOnlyReason: readOnlyReasons[0],
        readOnlyReasons: readOnlyReasons,
        initialValues: initialValuesState ?? {},
        getFieldValue,
        getFieldValues,
        setFieldValueLite,
        setFieldTouchedLite,
        setCustomReadOnly,
        removeCustomReadOnly,
        setCustomValidationHandler,
        removeCustomValidationHandler,
        setCustomWarningHandler,
        removeCustomWarningHandler,
        setPreSubmitHandler,
        removePreSubmitHandler,
        setPostSubmitHandler,
        removePostSubmitHandler,
        getCustomState,
        setCustomState,
        hasCustomState,
        setCustomFieldDirty,
        addEventListener: formEvents.addEventListener,
        removeEventListener: formEvents.removeEventListener,
        flowEngine: !!flowEngine,
        submit: submitFormReferenced,
        safeSubmit: safeSubmitForm,
        submitting,
        dirty,
        stagedDirty,
        showDirtyState: !!showDirtyState,
        flowEngineConfig,
        refetchForm: refetch,
    }), [
        id,
        model,
        customProps,
        ErrorComponent,
        onlySubmitMounted,
        onlyValidateMounted,
        onlyWarnMounted,
        onlyWarnChanged,
        readOnly,
        readOnlyReasons,
        initialValuesState,
        getFieldValue,
        getFieldValues,
        setFieldValueLite,
        setFieldTouchedLite,
        setCustomReadOnly,
        removeCustomReadOnly,
        setCustomValidationHandler,
        removeCustomValidationHandler,
        setCustomWarningHandler,
        removeCustomWarningHandler,
        setPreSubmitHandler,
        removePreSubmitHandler,
        setPostSubmitHandler,
        removePostSubmitHandler,
        getCustomState,
        setCustomState,
        hasCustomState,
        setCustomFieldDirty,
        formEvents,
        flowEngine,
        submitFormReferenced,
        safeSubmitForm,
        submitting,
        dirty,
        stagedDirty,
        showDirtyState,
        refetch,
    ]);
    if (error) {
        if (ErrorRenderer)
            return _jsx(ErrorRenderer, { customProps: customProps, error: error });
        return _jsx(Typography, { color: "error", children: error.message });
    }
    if (isLoading ||
        isDefaultRecordLoading ||
        isObjectEmpty(values) ||
        recordSwitched) {
        return _jsx(Loader, {});
    }
    const displayError = defaultRecordError || updateError;
    if (!serverData || serverData.length !== 2 || isObjectEmpty(serverData[0])) {
        // eslint-disable-next-line no-console
        console.error("[Components-Care] [FormEngine] Data is faulty", serverData ? JSON.stringify(serverData, undefined, 4) : null);
        throw new Error("Data is not present, this should never happen");
    }
    const innerForm = () => (_jsxs(DirtyStateContext.Provider, { value: showDirtyState ? dirtyFields : NO_DIRTY_STATE, children: [displayError && !nestedFormName && (_jsx(ErrorComponent, { error: displayError })), isLoading ? (_jsx("div", { style: loaderContainerStyles, children: _jsx(Loader, {}) })) : (_jsx(FormPageGuardContext.Provider, { value: pageGuard, children: _jsx(Children, { isSubmitting: submitting, values: props.renderConditionally ? asModelRecord(values) : undefined, submit: submitForm, safeSubmit: safeSubmitForm, reset: resetForm, dirty: dirty, stagedDirty: stagedDirty, id: id, customProps: customProps, disableRouting: !!props.disableRouting }) }))] }));
    return (_jsx(FormContextLite.Provider, { value: formContextDataLite, children: _jsx(FormContext.Provider, { value: formContextData, children: !parentFormContext && !renderFormAsDiv ? (_jsx(StyledForm, { onSubmit: handleSubmit, className: formClass, "aria-busy": submitting || undefined, "data-form-submitting": submitting, "data-form-dirty": dirty, "data-form-recordid": id, "data-form-modelid": model.modelId, children: innerForm() })) : (_jsx(StyledFormDiv, { className: formClass, "aria-busy": submitting || undefined, "data-form-submitting": submitting, "data-form-dirty": dirty, "data-form-recordid": id, "data-form-modelid": model.modelId, children: innerForm() })) }) }));
};
export default React.memo(Form);
