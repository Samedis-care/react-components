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
import React, { useCallback } from "react";
import TextFieldWithHelp from "../TextFieldWithHelp";
import { useInputCursorFix } from "../../../utils";
import useCCTranslations from "../../../utils/useCCTranslations";
var IntegerInputField = function (props) {
    var i18n = useCCTranslations().i18n;
    var value = props.value, onChange = props.onChange, muiProps = __rest(props, ["value", "onChange"]);
    var valueFormatted = value != null ? value.toLocaleString(i18n.language) : "";
    var _a = useInputCursorFix(valueFormatted), handleCursorChange = _a.handleCursorChange, cursorInputRef = _a.cursorInputRef;
    // on change handling
    var handleChange = useCallback(function (event) {
        handleCursorChange(event);
        if (!onChange)
            return;
        var num = event.target.value.replace(/[^0-9]/g, "");
        if (num != "") {
            var numericValue = parseInt(num);
            onChange(event, numericValue);
        }
        else {
            onChange(event, null);
        }
    }, [onChange, handleCursorChange]);
    // component rendering
    return (React.createElement("div", null,
        React.createElement(TextFieldWithHelp, __assign({}, muiProps, { value: valueFormatted, onChange: handleChange, inputProps: __assign(__assign({}, muiProps.inputProps), { ref: cursorInputRef }) }))));
};
export default React.memo(IntegerInputField);
