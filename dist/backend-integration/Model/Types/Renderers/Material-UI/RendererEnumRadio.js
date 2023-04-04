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
import { FormControlLabel, FormHelperText, FormLabel, Radio, RadioGroup, Typography, } from "@material-ui/core";
import TypeEnum from "../../TypeEnum";
import ccI18n from "../../../../../i18n";
import { FormControlFieldsetCC } from "../../../../../standalone";
/**
 * Renders TypeEnum as radio buttons
 */
var RendererEnumRadio = /** @class */ (function (_super) {
    __extends(RendererEnumRadio, _super);
    function RendererEnumRadio(values, horizontal, wrapButton, numericMode) {
        if (horizontal === void 0) { horizontal = false; }
        if (wrapButton === void 0) { wrapButton = function (btn) { return btn; }; }
        if (numericMode === void 0) { numericMode = false; }
        var _this = _super.call(this, values, numericMode) || this;
        _this.horizontal = horizontal;
        _this.wrapButton = wrapButton;
        return _this;
    }
    RendererEnumRadio.prototype.render = function (params) {
        var _this = this;
        var visibility = params.visibility, field = params.field, value = params.value, label = params.label, handleChange = params.handleChange, handleBlur = params.handleBlur, errorMsg = params.errorMsg, warningMsg = params.warningMsg;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: value, readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (React.createElement(FormControlFieldsetCC, { component: "fieldset", required: visibility.required, fullWidth: true, error: !!errorMsg, warning: !!warningMsg },
                React.createElement(FormLabel, { component: "legend" }, label),
                React.createElement(RadioGroup, { name: field, value: value, onChange: function (evt) { return handleChange(evt.target.name, evt.target.value); }, onBlur: handleBlur, row: this.horizontal }, this.values
                    .filter(function (value) { return !value.invisible; })
                    .map(function (entry) {
                    return _this.wrapButton(React.createElement(FormControlLabel, { key: entry.value, value: entry.value, control: React.createElement(Radio, null), label: entry.getLabel(), disabled: visibility.readOnly }), entry);
                })),
                React.createElement(FormHelperText, null, errorMsg || warningMsg)));
        }
        var valueInfo = this.values.find(function (entry) { return entry.value === value; });
        return (React.createElement(Typography, null,
            !visibility.grid && "".concat(label, ": "),
            valueInfo
                ? valueInfo.getLabel()
                : ccI18n.t("backend-integration.model.types.renderers.enum.unknown")));
    };
    return RendererEnumRadio;
}(TypeEnum));
export default RendererEnumRadio;
