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
import React from "react";
import { Typography } from "@mui/material";
import { FormHelperTextCC, IntegerInputField, NumberFormatter, } from "../../../../../standalone";
import TypeNumber from "../../TypeNumber";
/**
 * Renders a text field
 */
var RendererInteger = /** @class */ (function (_super) {
    __extends(RendererInteger, _super);
    function RendererInteger(props) {
        var _this = _super.call(this) || this;
        _this.props = props;
        return _this;
    }
    RendererInteger.prototype.render = function (params) {
        var visibility = params.visibility, field = params.field, value = params.value, label = params.label, handleChange = params.handleChange, handleBlur = params.handleBlur, errorMsg = params.errorMsg, warningMsg = params.warningMsg;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: this.stringify(value), readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (React.createElement(React.Fragment, null,
                React.createElement(IntegerInputField, __assign({ fullWidth: true }, this.props, { name: field, value: value, label: label, disabled: visibility.readOnly, required: visibility.required, onChange: function (evt, value) {
                        handleChange(evt.target.name, value);
                    }, onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg })),
                React.createElement(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg }, errorMsg || warningMsg)));
        }
        return (React.createElement(Typography, null,
            !visibility.grid && "".concat(label, ": "),
            React.createElement(NumberFormatter, { value: value })));
    };
    return RendererInteger;
}(TypeNumber));
export default RendererInteger;
