import React from "react";
import { Typography } from "@mui/material";
import ccI18n from "../../../../../i18n";
import { DateTimeInput, FormHelperTextCC } from "../../../../../standalone";
import i18n from "../../../../../i18n";
import TypeDateTimeNullable from "../../TypeDateTimeNullable";
import moment from "moment";
/**
 * Renders Date with Date Selector
 */
class RendererDateTimeNullable extends TypeDateTimeNullable {
    render(params) {
        const { visibility, field, value, touched, label, handleChange, handleBlur, errorMsg, warningMsg, setFieldTouched, } = params;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: value ? value.toISOString() : "", readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (React.createElement(React.Fragment, null,
                React.createElement(DateTimeInput, { value: value ? moment(value) : null, label: label, disabled: visibility.readOnly, required: visibility.required, onChange: (date) => handleChange(field, date ? date.toDate() : null), onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg, onError: (error) => {
                        this.error = error
                            ? ccI18n.t("backend-integration.model.types.renderers.date.validation-error")
                            : "";
                        setFieldTouched(field, touched, true);
                    } }),
                React.createElement(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg }, errorMsg || warningMsg)));
        }
        return (React.createElement(Typography, null,
            !visibility.grid && `${label}: `,
            value
                ? value.toLocaleString(i18n.language)
                : ccI18n.t("backend-integration.model.types.renderers.date.not-set")));
    }
}
export default RendererDateTimeNullable;
