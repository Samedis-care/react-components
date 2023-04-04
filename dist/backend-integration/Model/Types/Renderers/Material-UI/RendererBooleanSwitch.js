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
import { FormControlLabel, FormHelperText, Switch, Typography, } from "@material-ui/core";
import TypeBoolean from "../../TypeBoolean";
import ccI18n from "../../../../../i18n";
import { FormControlFieldsetCC } from "../../../../../standalone/UIKit/MuiWarning";
/**
 * Renders a TypeBoolean field as Switch
 */
var RendererBooleanSwitch = /** @class */ (function (_super) {
    __extends(RendererBooleanSwitch, _super);
    function RendererBooleanSwitch(invert, props) {
        var _this = _super.call(this) || this;
        _this.invert = invert;
        _this.props = props;
        return _this;
    }
    RendererBooleanSwitch.prototype.render = function (params) {
        var _this = this;
        var _a;
        var visibility = params.visibility, field = params.field, value = params.value, label = params.label, handleChange = params.handleChange, handleBlur = params.handleBlur, errorMsg = params.errorMsg, warningMsg = params.warningMsg;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, checked: value, readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (React.createElement(FormControlFieldsetCC, { required: visibility.required, error: !!errorMsg, warning: !!warningMsg, component: "fieldset" },
                React.createElement(FormControlLabel, { control: React.createElement(Switch, __assign({}, (_a = this.props) === null || _a === void 0 ? void 0 : _a.switchProps, { name: field, checked: this.invert ? !value : value, disabled: visibility.readOnly, onChange: function (evt, checked) {
                            handleChange(evt.target.name, _this.invert ? !checked : checked);
                        }, onBlur: handleBlur })), label: label }),
                React.createElement(FormHelperText, null, errorMsg || warningMsg)));
        }
        return (React.createElement(Typography, null,
            !visibility.grid && "".concat(label, ": "),
            value
                ? ccI18n.t("backend-integration.model.types.renderers.boolean.true")
                : ccI18n.t("backend-integration.model.types.renderers.boolean.false")));
    };
    return RendererBooleanSwitch;
}(TypeBoolean));
export default RendererBooleanSwitch;
