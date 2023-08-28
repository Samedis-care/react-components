var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
import { Typography } from "@mui/material";
import MultiLanguageInput from "../../../../standalone/UIKit/InputControls/MultiLanguageInput";
import TypeLocalizedString from "../TypeLocalizedString";
import { FormHelperTextCC } from "../../../../standalone";
/**
 * Renders a text field
 */
var RendererLocalizedString = /** @class */ (function (_super) {
    __extends(RendererLocalizedString, _super);
    function RendererLocalizedString(props) {
        var _this = _super.call(this, props === null || props === void 0 ? void 0 : props.multiline) || this;
        var getFallbackLabel = props.getFallbackLabel, getFallbackLabelValues = props.getFallbackLabelValues, other = __rest(props, ["getFallbackLabel", "getFallbackLabelValues"]);
        _this.props = other;
        _this.extra = {
            getFallbackLabel: getFallbackLabel,
            getFallbackLabelValues: getFallbackLabelValues,
        };
        _this.settings = {
            updateHooks: getFallbackLabelValues,
        };
        return _this;
    }
    RendererLocalizedString.prototype.render = function (params) {
        var visibility = params.visibility, field = params.field, value = params.value, label = params.label, handleChange = params.handleChange, handleBlur = params.handleBlur, errorMsg = params.errorMsg, warningMsg = params.warningMsg;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: JSON.stringify(value !== null && value !== void 0 ? value : {}), readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (React.createElement(React.Fragment, null,
                React.createElement(MultiLanguageInput, __assign({}, this.props, { name: field, values: value !== null && value !== void 0 ? value : {}, label: label, disabled: visibility.readOnly, required: visibility.required, onChange: function (newValues) {
                        handleChange(field, newValues);
                    }, onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg })),
                React.createElement(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg }, errorMsg || warningMsg)));
        }
        return (React.createElement(Typography, { noWrap: visibility.grid },
            !visibility.grid && "".concat(label, ": "),
            this.stringify(value) ||
                (this.extra.getFallbackLabel
                    ? this.extra.getFallbackLabel(value, params.values)
                    : "")));
    };
    return RendererLocalizedString;
}(TypeLocalizedString));
export default RendererLocalizedString;
