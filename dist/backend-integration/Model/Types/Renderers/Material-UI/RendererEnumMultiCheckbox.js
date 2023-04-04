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
import { FormControlLabel, FormHelperText, FormLabel, Typography, Checkbox, FormGroup, } from "@material-ui/core";
import TypeEnumMulti from "../../TypeEnumMulti";
import ccI18n from "../../../../../i18n";
import { FormControlFieldsetCC } from "../../../../../standalone";
/**
 * Renders TypeEnumMulti as checkboxes
 */
var RendererEnumRadio = /** @class */ (function (_super) {
    __extends(RendererEnumRadio, _super);
    function RendererEnumRadio(values, horizontal, wrapButton) {
        if (horizontal === void 0) { horizontal = false; }
        if (wrapButton === void 0) { wrapButton = function (btn) { return btn; }; }
        var _this = _super.call(this, values) || this;
        _this.horizontal = horizontal;
        _this.wrapButton = wrapButton;
        return _this;
    }
    RendererEnumRadio.prototype.render = function (params) {
        var _this = this;
        var visibility = params.visibility, field = params.field, label = params.label, handleChange = params.handleChange, handleBlur = params.handleBlur, errorMsg = params.errorMsg, warningMsg = params.warningMsg, value = params.value;
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
                React.createElement(FormGroup, { onBlur: handleBlur, row: this.horizontal, "data-name": field }, this.values
                    .filter(function (entry) { return !entry.invisible; })
                    .map(function (entry) {
                    return _this.wrapButton(React.createElement(FormControlLabel, { key: entry.value, value: entry.value, control: React.createElement(Checkbox, { checked: value.includes(entry.value), name: entry.value, onChange: function (evt) {
                                return handleChange(field, evt.target.checked
                                    ? value.concat([entry.value]) // add value
                                    : value.filter(function (v) { return v !== entry.value; }) // remove value
                                );
                            } }), label: entry.getLabel(), disabled: visibility.readOnly }), entry);
                })),
                React.createElement(FormHelperText, null, errorMsg || warningMsg)));
        }
        return (React.createElement(Typography, null,
            !visibility.grid && "".concat(label, ": "),
            value
                .map(function (enumValue) {
                var valueInfo = _this.values.find(function (entry) { return entry.value === enumValue; });
                return valueInfo
                    ? valueInfo.getLabel()
                    : ccI18n.t("backend-integration.model.types.renderers.enum.unknown");
            })
                .join(", ")));
    };
    return RendererEnumRadio;
}(TypeEnumMulti));
export default RendererEnumRadio;
