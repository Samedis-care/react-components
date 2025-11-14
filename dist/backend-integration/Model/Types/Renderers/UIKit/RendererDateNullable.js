import React from "react";
import { Typography } from "@mui/material";
import TypeDateNullable from "../../TypeDateNullable";
import ccI18n from "../../../../../i18n";
import { normalizeDate } from "../../Utils/DateUtils";
import { DateInput, FormHelperTextCC } from "../../../../../standalone";
import { ToDateLocaleStringOptions } from "../../../../../constants";
/**
 * Renders Date with Date Selector
 */
class RendererDateNullable extends TypeDateNullable {
    props;
    constructor(props) {
        super();
        this.props = props;
    }
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
                React.createElement(DateInput, { ...this.props, name: field, value: value, label: label, disabled: visibility.readOnly, required: visibility.required, onChange: (date) => handleChange(field, date ? normalizeDate(date) : null), onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg, onError: (error) => {
                        this.error = error
                            ? ccI18n.t("backend-integration.model.types.renderers.date.validation-error")
                            : "";
                        setFieldTouched(field, touched, true);
                    }, fullWidth: true }),
                React.createElement(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg }, errorMsg || warningMsg)));
        }
        return (React.createElement(Typography, null,
            !visibility.grid && `${label}: `,
            value
                ? value.toLocaleDateString(ccI18n.language, ToDateLocaleStringOptions)
                : ccI18n.t("backend-integration.model.types.renderers.date.not-set")));
    }
    dataGridColumnSizingHint = () => {
        const def = Math.max(ccI18n.t("backend-integration.model.types.renderers.date.not-set")
            .length, 10) * 10;
        return [0, Number.MAX_SAFE_INTEGER, def];
    };
}
export default RendererDateNullable;
