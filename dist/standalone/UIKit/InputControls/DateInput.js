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
import React from "react";
import { InputLabelConfig } from "../CommonStyles";
import { LocalizedKeyboardDatePicker } from "../../../standalone/LocalizedDateTimePickers";
import TextFieldWithHelp from "../TextFieldWithHelp";
import { localDateToUtcDate } from "../../../utils";
var CustomInput = React.forwardRef(function DateInputCustomTextField(props, ref) {
    return React.createElement(TextFieldWithHelp, __assign({}, props, { ref: ref }));
});
var DateInput = function (props) {
    var value = props.value, onChange = props.onChange, hideDisabledIcon = props.hideDisabledIcon, muiProps = __rest(props, ["value", "onChange", "hideDisabledIcon"]);
    return (React.createElement(LocalizedKeyboardDatePicker, __assign({}, muiProps, { value: value, onChange: function (date) {
            return date ? onChange(localDateToUtcDate(date.toDate())) : onChange(null);
        }, clearable: true, hideDisabledIcon: hideDisabledIcon, TextFieldComponent: CustomInput, InputLabelProps: InputLabelConfig })));
};
export default React.memo(DateInput);
