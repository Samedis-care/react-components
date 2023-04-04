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
import React, { useCallback, useContext, useEffect, useMemo, useRef, } from "react";
import { useFormContext } from "./Form";
import { getVisibility } from "../../backend-integration/Model/Visibility";
import { dotsToObject, getValueByDot } from "../../utils";
import shallowCompare from "../../utils/shallowCompare";
export var FormFieldContext = React.createContext(null);
export var useFormFieldContext = function () {
    var ctx = useContext(FormFieldContext);
    if (!ctx)
        throw new Error("FormFieldContext not set");
    return ctx;
};
var Field = function (props) {
    var _a, _b;
    var _c = useFormContext(), values = _c.values, errors = _c.errors, warnings = _c.warnings, touched = _c.touched, setFieldValue = _c.setFieldValue, handleBlur = _c.handleBlur, initialValues = _c.initialValues, setFieldTouched = _c.setFieldTouched, setError = _c.setError, model = _c.model, markFieldMounted = _c.markFieldMounted, relations = _c.relations, readOnly = _c.readOnly;
    var fieldDef = model.fields[props.name];
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
    var type = fieldDef.type, getRelationModel = fieldDef.getRelationModel, getRelationModelValues = fieldDef.getRelationModelValues;
    var setFieldValueHookWrapper = useCallback(function (field, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value, shouldValidate, triggerOnChange) {
        setFieldValue(field, value, shouldValidate, triggerOnChange !== null && triggerOnChange !== void 0 ? triggerOnChange : true);
    }, [setFieldValue]);
    // mark field as mounted
    useEffect(function () {
        markFieldMounted(props.name, true);
        return function () { return markFieldMounted(props.name, false); };
    }, [markFieldMounted, props.name]);
    var name = props.name;
    var value = getValueByDot(name, values);
    var initialValue = initialValues[name];
    var hasId = "id" in values && values["id"];
    var label = fieldDef.getLabel();
    var touch = touched[props.name] || false;
    var errorMsg = (touch && errors[props.name]) || null;
    var warningMsg = (touch && warnings[props.name]) || null;
    var relationData = relations[props.name];
    var visibility = getVisibility(hasId ? fieldDef.visibility.edit : fieldDef.visibility.create, values, initialValues);
    // cache these, so we don't trigger useless re-renders every time a value changes
    var prevRelationModelValues = useRef({});
    var prevRelationModelValuesResult = useRef({});
    var relationModelValues = useMemo(function () {
        var pick = getRelationModelValues !== null && getRelationModelValues !== void 0 ? getRelationModelValues : [];
        var result = {};
        pick.forEach(function (field) { return (result[field] = getValueByDot(field, values)); });
        if (shallowCompare(prevRelationModelValues.current, result)) {
            return prevRelationModelValuesResult.current;
        }
        prevRelationModelValues.current = result;
        return (prevRelationModelValuesResult.current = dotsToObject(result));
    }, [values, getRelationModelValues]);
    var relationModel = useMemo(function () {
        return getRelationModel
            ? getRelationModel(hasId || null, relationModelValues)
            : undefined;
    }, [getRelationModel, hasId, relationModelValues]);
    var cacheKey = useMemo(function () { return new Object(); }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ((_b = (_a = fieldDef.type.settings) === null || _a === void 0 ? void 0 : _a.updateHooks) !== null && _b !== void 0 ? _b : []).map(function (key) {
        return getValueByDot(key, values);
    }));
    return useMemo(function () {
        var renderParams = {
            field: name,
            value: value,
            touched: touch,
            initialValue: initialValue,
            visibility: readOnly ? __assign(__assign({}, visibility), { readOnly: true }) : visibility,
            handleChange: setFieldValueHookWrapper,
            handleBlur: handleBlur,
            label: label,
            errorMsg: errorMsg,
            warningMsg: warningMsg,
            setError: setError,
            setFieldTouched: setFieldTouched,
            relationModel: relationModel,
            relationData: relationData,
            values: values,
        };
        return (React.createElement(FormFieldContext.Provider, { value: __assign(__assign({}, renderParams), { type: type }) }, type.render(renderParams)));
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
