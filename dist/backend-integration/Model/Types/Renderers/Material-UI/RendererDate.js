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
import { Typography } from "@material-ui/core";
import ccI18n from "../../../../../i18n";
import { normalizeDate } from "../../Utils/DateUtils";
import TypeDate from "../../TypeDate";
import { LocalizedKeyboardDatePicker } from "../../../../../standalone/LocalizedDateTimePickers";
import i18n from "../../../../../i18n";
import { ToDateLocaleStringOptions } from "../../../../../constants";
import { FormHelperTextCC } from "../../../../../standalone";
/**
 * Renders Date with Date Selector
 */
var RendererDate = /** @class */ (function (_super) {
    __extends(RendererDate, _super);
    function RendererDate() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dataGridColumnSizingHint = function () {
            var def = Math.max(ccI18n.t("backend-integration.model.types.renderers.date.not-set")
                .length, 10 // date length
            ) * 10;
            return [0, Number.MAX_SAFE_INTEGER, def];
        };
        return _this;
    }
    RendererDate.prototype.render = function (params) {
        var _this = this;
        var visibility = params.visibility, field = params.field, value = params.value, touched = params.touched, label = params.label, handleChange = params.handleChange, handleBlur = params.handleBlur, errorMsg = params.errorMsg, setFieldTouched = params.setFieldTouched, warningMsg = params.warningMsg;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: value ? value.toISOString() : "", readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (React.createElement(React.Fragment, null,
                React.createElement(LocalizedKeyboardDatePicker, { name: field, value: value, label: label, disabled: visibility.readOnly, required: visibility.required, onChange: function (date) {
                        if (!date)
                            throw new Error("Date is null");
                        else
                            handleChange(field, normalizeDate(date.toDate()));
                    }, onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg, onError: function (error) {
                        _this.error = error
                            ? ccI18n.t("backend-integration.model.types.renderers.date.validation-error")
                            : "";
                        setFieldTouched(field, touched, true);
                    }, fullWidth: true }),
                React.createElement(FormHelperTextCC, { warning: !!warningMsg, error: !!errorMsg }, errorMsg || warningMsg)));
        }
        return (React.createElement(Typography, null,
            !visibility.grid && "".concat(label, ": "),
            value
                ? value.toLocaleDateString(i18n.language, ToDateLocaleStringOptions)
                : ccI18n.t("backend-integration.model.types.renderers.date.not-set")));
    };
    return RendererDate;
}(TypeDate));
export default RendererDate;
