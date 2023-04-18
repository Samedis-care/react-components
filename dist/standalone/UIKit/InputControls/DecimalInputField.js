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
import React, { useCallback, useState } from "react";
import TextFieldWithHelp from "../TextFieldWithHelp";
import { getNumberSeparator, parseLocalizedNumber, useInputCursorFix, } from "../../../utils";
import useCCTranslations from "../../../utils/useCCTranslations";
var DecimalInputField = function (props) {
    var i18n = useCCTranslations().i18n;
    var value = props.value, onChange = props.onChange, muiProps = __rest(props, ["value", "onChange"]);
    var decimalSeparator = getNumberSeparator("decimal");
    var _a = useState(false), danglingDecimalSeparator = _a[0], setDanglingDecimalSeparator = _a[1];
    var valueFormatted = value !== null
        ? value.toLocaleString(i18n.language) +
            (danglingDecimalSeparator && !muiProps.disabled ? decimalSeparator : "")
        : "";
    var _b = useInputCursorFix(valueFormatted), handleCursorChange = _b.handleCursorChange, cursorInputRef = _b.cursorInputRef;
    // on change handling
    var handleChange = useCallback(function (event) {
        handleCursorChange(event);
        if (!onChange)
            return;
        setDanglingDecimalSeparator(event.target.value.endsWith(decimalSeparator));
        onChange(event, parseLocalizedNumber(event.target.value));
    }, [onChange, handleCursorChange, decimalSeparator]);
    return (React.createElement(TextFieldWithHelp, __assign({}, muiProps, { value: valueFormatted, onChange: handleChange, inputProps: __assign(__assign({}, muiProps.inputProps), { ref: cursorInputRef }) })));
};
export default React.memo(DecimalInputField);
