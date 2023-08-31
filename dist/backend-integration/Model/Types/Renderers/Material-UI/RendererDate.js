import React from "react";
import { Typography } from "@mui/material";
import ccI18n from "../../../../../i18n";
import { normalizeDate } from "../../Utils/DateUtils";
import TypeDate from "../../TypeDate";
import { LocalizedKeyboardDatePicker } from "../../../../../standalone/LocalizedDateTimePickers";
import i18n from "../../../../../i18n";
import { ToDateLocaleStringOptions } from "../../../../../constants";
import { FormHelperTextCC } from "../../../../../standalone";
import moment from "moment";
/**
 * Renders Date with Date Selector
 */
class RendererDate extends TypeDate {
    render(params) {
        const { visibility, field, value, touched, label, handleChange, handleBlur, errorMsg, setFieldTouched, warningMsg, } = params;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: value ? value.toISOString() : "", readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (React.createElement(React.Fragment, null,
                React.createElement(LocalizedKeyboardDatePicker, { value: value ? moment(value) : null, label: label, disabled: visibility.readOnly, required: visibility.required, onChange: (date) => {
                        if (!date)
                            throw new Error("Date is null");
                        else
                            handleChange(field, normalizeDate(date.toDate()));
                    }, onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg, onError: (error) => {
                        this.error = error
                            ? ccI18n.t("backend-integration.model.types.renderers.date.validation-error")
                            : "";
                        setFieldTouched(field, touched, true);
                    }, fullWidth: true }),
                React.createElement(FormHelperTextCC, { warning: !!warningMsg, error: !!errorMsg }, errorMsg || warningMsg)));
        }
        return (React.createElement(Typography, null,
            !visibility.grid && `${label}: `,
            value
                ? value.toLocaleDateString(i18n.language, ToDateLocaleStringOptions)
                : ccI18n.t("backend-integration.model.types.renderers.date.not-set")));
    }
    dataGridColumnSizingHint = () => {
        const def = Math.max(ccI18n.t("backend-integration.model.types.renderers.date.not-set")
            .length, 10 // date length
        ) * 10;
        return [0, Number.MAX_SAFE_INTEGER, def];
    };
}
export default RendererDate;
