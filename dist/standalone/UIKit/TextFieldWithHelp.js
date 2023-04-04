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
import React, { useCallback, useEffect, useRef, useState, } from "react";
import { TextField, IconButton, InputAdornment, } from "@material-ui/core";
import { Info as InfoIcon, Clear as ClearIcon } from "@material-ui/icons";
import { InputLabelConfig, useInputStyles } from "./CommonStyles";
import { combineClassNames, isTouchDevice } from "../../utils";
import { useMuiWarningStyles } from "./MuiWarning";
var TextFieldWithHelp = React.forwardRef(function TextFieldWithHelpInner(props, ref) {
    var _a, _b, _c, _d;
    var openInfo = props.openInfo, important = props.important, warning = props.warning, onChange = props.onChange, muiProps = __rest(props, ["openInfo", "important", "warning", "onChange"]);
    var inputClasses = useInputStyles({ important: important });
    var warningClasses = useMuiWarningStyles();
    // handle clear
    var _e = useState(!!((_a = muiProps.value) !== null && _a !== void 0 ? _a : muiProps.defaultValue)), hasValue = _e[0], setHasValue = _e[1];
    var inputRef = useRef(null);
    var handleClear = useCallback(function () {
        var _a;
        if (!inputRef.current) {
            throw new Error("InputRef not set");
        }
        var proto = (muiProps.multiline ? HTMLTextAreaElement : HTMLInputElement)
            .prototype;
        // eslint-disable-next-line @typescript-eslint/unbound-method
        var nativeInputValueSetter = (_a = Object.getOwnPropertyDescriptor(proto, "value")) === null || _a === void 0 ? void 0 : _a.set;
        if (!nativeInputValueSetter) {
            throw new Error("Native Input Value Setter is undefined");
        }
        nativeInputValueSetter.call(inputRef.current, "");
        var event = new Event("input", { bubbles: true });
        inputRef.current.dispatchEvent(event);
    }, [muiProps.multiline]);
    // keep "hasValue" up to date
    var handleChange = useCallback(function (evt) {
        if (onChange)
            onChange(evt);
        setHasValue(!!evt.target.value);
    }, [onChange]);
    useEffect(function () {
        setHasValue(!!muiProps.value);
    }, [muiProps.value]);
    // render
    return (React.createElement(TextField, __assign({ ref: ref, InputLabelProps: InputLabelConfig }, muiProps, { className: combineClassNames([
            warning && warningClasses.warning,
            muiProps.className,
        ]), onChange: handleChange, InputProps: __assign(__assign({ classes: inputClasses }, muiProps.InputProps), { endAdornment: (React.createElement(React.Fragment, null,
                React.createElement(InputAdornment, { position: "end" },
                    isTouchDevice() && hasValue && !muiProps.disabled && (React.createElement(IconButton, { onClick: handleClear },
                        React.createElement(ClearIcon, null))), (_d = (_c = (_b = muiProps.InputProps) === null || _b === void 0 ? void 0 : _b.endAdornment) === null || _c === void 0 ? void 0 : _c.props) === null || _d === void 0 ? void 0 :
                    _d.children,
                    openInfo && (React.createElement(IconButton, { onClick: openInfo },
                        React.createElement(InfoIcon, { color: "disabled" })))))) }), inputProps: __assign(__assign({}, muiProps.inputProps), { ref: inputRef }) })));
});
export default React.memo(TextFieldWithHelp);
