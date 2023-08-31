import React, { useCallback, useContext, useEffect, useMemo, useRef, } from "react";
import { useFormContext } from "./Form";
import { getVisibility } from "../../backend-integration/Model/Visibility";
import { dotsToObject, getValueByDot } from "../../utils";
import shallowCompare from "../../utils/shallowCompare";
export const FormFieldContext = React.createContext(null);
export const useFormFieldContext = () => {
    const ctx = useContext(FormFieldContext);
    if (!ctx)
        throw new Error("FormFieldContext not set");
    return ctx;
};
const Field = (props) => {
    const { values, errors, warnings, touched, setFieldValue, handleBlur, initialValues, setFieldTouched, setError, model, markFieldMounted, relations, readOnly, } = useFormContext();
    let fieldDef = model.fields[props.name];
    if (!fieldDef)
        throw new Error("Invalid field name specified: " + props.name);
    if (props.overrides) {
        if (typeof props.overrides === "function") {
            fieldDef = props.overrides(fieldDef);
        }
        else if (typeof props.overrides === "object") {
            fieldDef = Object.assign({}, fieldDef, props.overrides);
        }
    }
    const { type, getRelationModel, getRelationModelValues } = fieldDef;
    const setFieldValueHookWrapper = useCallback((field, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value, shouldValidate, triggerOnChange) => {
        setFieldValue(field, value, shouldValidate, triggerOnChange ?? true);
    }, [setFieldValue]);
    // mark field as mounted
    useEffect(() => {
        markFieldMounted(props.name, true);
        return () => markFieldMounted(props.name, false);
    }, [markFieldMounted, props.name]);
    const { name } = props;
    const value = getValueByDot(name, values);
    const initialValue = initialValues[name];
    const hasId = "id" in values && values["id"];
    const label = fieldDef.getLabel();
    const touch = touched[props.name] || false;
    const errorMsg = (touch && errors[props.name]) || null;
    const warningMsg = (touch && warnings[props.name]) || null;
    const relationData = relations[props.name];
    const visibility = getVisibility(hasId ? fieldDef.visibility.edit : fieldDef.visibility.create, values, initialValues);
    // cache these, so we don't trigger useless re-renders every time a value changes
    const prevRelationModelValues = useRef({});
    const prevRelationModelValuesResult = useRef({});
    const relationModelValues = useMemo(() => {
        const pick = getRelationModelValues ?? [];
        const result = {};
        pick.forEach((field) => (result[field] = getValueByDot(field, values)));
        if (shallowCompare(prevRelationModelValues.current, result)) {
            return prevRelationModelValuesResult.current;
        }
        prevRelationModelValues.current = result;
        return (prevRelationModelValuesResult.current = dotsToObject(result));
    }, [values, getRelationModelValues]);
    const relationModel = useMemo(() => getRelationModel
        ? getRelationModel(hasId || null, relationModelValues)
        : undefined, [getRelationModel, hasId, relationModelValues]);
    const cacheKey = useMemo(() => new Object(), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (fieldDef.type.settings?.updateHooks ?? []).map((key) => getValueByDot(key, values)));
    return useMemo(() => {
        const renderParams = {
            field: name,
            value: value,
            touched: touch,
            initialValue: initialValue,
            visibility: readOnly ? { ...visibility, readOnly: true } : visibility,
            handleChange: setFieldValueHookWrapper,
            handleBlur,
            label: label,
            errorMsg,
            warningMsg,
            setError,
            setFieldTouched,
            relationModel,
            relationData,
            values,
        };
        return (React.createElement(FormFieldContext.Provider, { value: { ...renderParams, type } }, type.render(renderParams)));
    }, 
    // do not update every time values change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
        value,
        name,
        type,
        label,
        visibility,
        setFieldValueHookWrapper,
        handleBlur,
        errorMsg,
        warningMsg,
        setError,
        setFieldTouched,
        initialValue,
        touch,
        relationModel,
        relationData,
        readOnly,
        cacheKey, // check for important values changes
    ]);
};
export default React.memo(Field);
