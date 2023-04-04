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
import { Typography } from "@material-ui/core";
import TypeDateNullable from "../../TypeDateNullable";
import ccI18n from "../../../../../i18n";
import { normalizeDate } from "../../Utils/DateUtils";
import { DateInput, FormHelperTextCC } from "../../../../../standalone";
import i18n from "../../../../../i18n";
import { ToDateLocaleStringOptions } from "../../../../../constants";
/**
 * Renders Date with Date Selector
 */
var RendererDateNullable = /** @class */ (function (_super) {
    __extends(RendererDateNullable, _super);
    function RendererDateNullable(props) {
        var _this = _super.call(this) || this;
        _this.dataGridColumnSizingHint = function () {
            var def = Math.max(ccI18n.t("backend-integration.model.types.renderers.date.not-set")
                .length, 10 // date length
            ) * 10;
            return [0, Number.MAX_SAFE_INTEGER, def];
        };
        _this.props = props;
        return _this;
    }
    RendererDateNullable.prototype.render = function (params) {
        var _this = this;
        var visibility = params.visibility, field = params.field, value = params.value, touched = params.touched, label = params.label, handleChange = params.handleChange, handleBlur = params.handleBlur, errorMsg = params.errorMsg, warningMsg = params.warningMsg, setFieldTouched = params.setFieldTouched;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: value ? value.toISOString() : "", readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (React.createElement(React.Fragment, null,
                React.createElement(DateInput, __assign({}, this.props, { name: field, value: value, label: label, disabled: visibility.readOnly, required: visibility.required, onChange: function (date) {
                        return handleChange(field, date ? normalizeDate(date) : null);
                    }, onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg, onError: function (error) {
                        _this.error = error
                            ? ccI18n.t("backend-integration.model.types.renderers.date.validation-error")
                            : "";
                        setFieldTouched(field, touched, true);
                    }, fullWidth: true, clearable: true })),
                React.createElement(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg }, errorMsg || warningMsg)));
        }
        return (React.createElement(Typography, null,
            !visibility.grid && "".concat(label, ": "),
            value
                ? value.toLocaleDateString(i18n.language, ToDateLocaleStringOptions)
                : ccI18n.t("backend-integration.model.types.renderers.date.not-set")));
    };
    return RendererDateNullable;
}(TypeDateNullable));
export default RendererDateNullable;
