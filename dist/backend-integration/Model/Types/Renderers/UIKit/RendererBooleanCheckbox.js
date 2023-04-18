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
import React from "react";
import { FormControlLabel, FormHelperText, Typography } from "@mui/material";
import TypeBoolean from "../../TypeBoolean";
import ccI18n from "../../../../../i18n";
import Checkbox from "../../../../../standalone/UIKit/Checkbox";
import { FormControlFieldsetCC } from "../../../../../standalone";
/**
 * Renders a TypeBoolean field as Checkbox
 */
var RendererBooleanCheckbox = /** @class */ (function (_super) {
    __extends(RendererBooleanCheckbox, _super);
    function RendererBooleanCheckbox(invert) {
        var _this = _super.call(this) || this;
        _this.invert = invert;
        return _this;
    }
    RendererBooleanCheckbox.prototype.render = function (params) {
        var _this = this;
        var visibility = params.visibility, field = params.field, value = params.value, label = params.label, handleChange = params.handleChange, handleBlur = params.handleBlur, errorMsg = params.errorMsg, warningMsg = params.warningMsg;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, checked: value, readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            var control = (React.createElement(Checkbox, { name: field, checked: this.invert ? !value : value, disabled: visibility.readOnly, onChange: function (evt, checked) {
                    handleChange(evt.target.name, _this.invert ? !checked : checked);
                }, onBlur: handleBlur, "data-name": field }));
            return visibility.grid ? (control) : (React.createElement(FormControlFieldsetCC, { required: visibility.required, error: !!errorMsg, warning: !!warningMsg, component: "fieldset", "data-name": field },
                React.createElement(FormControlLabel, { control: control, label: label }),
                React.createElement(FormHelperText, null, errorMsg || warningMsg)));
        }
        return (React.createElement(Typography, null,
            !visibility.grid && "".concat(label, ": "),
            value
                ? ccI18n.t("backend-integration.model.types.renderers.boolean.true")
                : ccI18n.t("backend-integration.model.types.renderers.boolean.false")));
    };
    return RendererBooleanCheckbox;
}(TypeBoolean));
export default RendererBooleanCheckbox;
