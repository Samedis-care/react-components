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
import { FormHelperText, Typography } from "@material-ui/core";
import TypeEnum from "../TypeEnum";
import ccI18n from "../../../../i18n";
import { getStringLabel, SingleSelect, } from "../../../../standalone/Selector";
import { FormControlFieldsetCC } from "../../../../standalone";
/**
 * Renders TypeEnum as drop-down selector (with search)
 */
var RendererEnumSelect = /** @class */ (function (_super) {
    __extends(RendererEnumSelect, _super);
    function RendererEnumSelect(values, props, numericMode) {
        if (numericMode === void 0) { numericMode = false; }
        var _this = _super.call(this, values, numericMode) || this;
        _this.props = props;
        return _this;
    }
    RendererEnumSelect.prototype.render = function (params) {
        var visibility = params.visibility, field = params.field, value = params.value, label = params.label, handleChange = params.handleChange, handleBlur = params.handleBlur, errorMsg = params.errorMsg, warningMsg = params.warningMsg;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: value, readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            var data_1 = this.values
                .filter(function (entry) { return !entry.invisible; })
                .map(function (entry) { return (__assign(__assign({}, entry), { label: entry.getLabel() })); });
            var selected = data_1.find(function (entry) { return entry.value === value; }) || null;
            var onLoad = function (query) {
                return data_1.filter(function (entry) {
                    return getStringLabel(entry).toLowerCase().includes(query.toLowerCase());
                });
            };
            return (React.createElement(FormControlFieldsetCC, { component: "fieldset", required: visibility.required, fullWidth: true, error: !!errorMsg, warning: !!warningMsg, onBlur: handleBlur, name: field },
                React.createElement(SingleSelect, __assign({}, this.props, { label: label, selected: selected, onLoad: onLoad, onSelect: function (value) { return handleChange(field, value ? value.value : ""); }, disabled: visibility.readOnly })),
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
