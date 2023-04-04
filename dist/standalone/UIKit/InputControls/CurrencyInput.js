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
import React, { useCallback, useEffect, useState } from "react";
import TextFieldWithHelp from "../TextFieldWithHelp";
import { parseLocalizedNumber } from "../../../utils";
import useCCTranslations from "../../../utils/useCCTranslations";
var CurrencyInput = function (props) {
    var value = props.value, onChange = props.onChange, onBlur = props.onBlur, currency = props.currency, muiProps = __rest(props, ["value", "onChange", "onBlur", "currency"]);
    var i18n = useCCTranslations().i18n;
    var formatNumber = useCallback(function (value) {
        return value != null
            ? value.toLocaleString(i18n.language, {
                style: "currency",
                currency: currency,
            })
            : "";
    }, [currency, i18n.language]);
    var valueFormatted = formatNumber(value);
    var _a = useState(valueFormatted), valueInternal = _a[0], setValueInternal = _a[1];
    useEffect(function () { return setValueInternal(formatNumber(value)); }, [formatNumber, value]);
    var _b = useState(null), lastChangeEvent = _b[0], setLastChangeEvent = _b[1];
    var _c = useState(false), error = _c[0], setError = _c[1];
    // on change handling
    var handleChange = useCallback(function (event) {
        if (!onChange)
            return;
        setValueInternal(event.target.value);
        event.persist();
        setLastChangeEvent(event);
    }, [onChange]);
    var handleBlur = useCallback(function (evt) {
        if (onBlur)
            onBlur(evt);
        if (lastChangeEvent) {
            var value_1 = parseLocalizedNumber(valueInternal);
            if (value_1 != null && isNaN(value_1)) {
                setError(true);
            }
            else if (onChange) {
                setError(false);
                var formatted = formatNumber(value_1);
                // we parse here so decimal points are limited and view always matches data
                onChange(lastChangeEvent, parseLocalizedNumber(formatted));
            }
        }
    }, [formatNumber, lastChangeEvent, onBlur, onChange, valueInternal]);
    // component rendering
    return (React.createElement("div", null,
        React.createElement(TextFieldWithHelp, __assign({}, muiProps, { value: valueInternal, onChange: handleChange, onBlur: handleBlur, error: error || muiProps.error }))));
};
export default React.memo(CurrencyInput);
