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
import { FormHelperText, InputLabel, MenuItem, Select, Typography, } from "@material-ui/core";
import TypeEnum from "../../TypeEnum";
import ccI18n from "../../../../../i18n";
import { FormControlFieldsetCC } from "../../../../../standalone";
/**
 * Renders TypeEnum as drop-down selector (without search)
 */
var RendererEnumSelect = /** @class */ (function (_super) {
    __extends(RendererEnumSelect, _super);
    function RendererEnumSelect() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RendererEnumSelect.prototype.render = function (params) {
        var visibility = params.visibility, field = params.field, value = params.value, label = params.label, handleChange = params.handleChange, handleBlur = params.handleBlur, errorMsg = params.errorMsg, warningMsg = params.warningMsg;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: value, readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            return (React.createElement(FormControlFieldsetCC, { component: "fieldset", required: visibility.required, fullWidth: true, error: !!errorMsg, warning: !!warningMsg },
                React.createElement(InputLabel, { shrink: true }, label),
                React.createElement(Select, { name: field, value: value, disabled: visibility.readOnly, onChange: function (evt) { return handleChange(field, evt.target.value); }, onBlur: handleBlur }, this.values.map(function (entry) { return (React.createElement(MenuItem, { key: entry.value, value: entry.value }, entry.getLabel())); })),
                React.createElement(FormHelperText, null, errorMsg || warningMsg)));
        }
        var valueInfo = this.values.find(function (entry) { return entry.value === value; });
        return (React.createElement(Typography, null,
            !visibility.grid && "".concat(label, ": "),
            valueInfo
                ? valueInfo.getLabel()
                : ccI18n.t("backend-integration.model.types.renderers.enum.unknown")));
    };
    return RendererEnumSelect;
}(TypeEnum));
export default RendererEnumSelect;
