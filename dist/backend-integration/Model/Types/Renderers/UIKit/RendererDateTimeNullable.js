import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Typography } from "@mui/material";
import ccI18n from "../../../../../i18n";
import getCurrentLocale from "../../../../../utils/getCurrentLocale";
import { DateTimeInput } from "../../../../../standalone";
import TypeDateTimeNullable from "../../TypeDateTimeNullable";
import moment from "moment";
/**
 * Renders Date with Date Selector
 */
class RendererDateTimeNullable extends TypeDateTimeNullable {
    render(params) {
        const { visibility, field, value, touched, label, handleChange, handleBlur, errorMsg, warningMsg, dirty, autoFocus, setFieldTouched, } = params;
        if (visibility.disabled)
            return _jsx(_Fragment, {});
        if (visibility.hidden) {
            return (_jsx("input", { type: "hidden", name: field, value: value ? value.toISOString() : "", readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (_jsx(DateTimeInput, { value: value ? moment(value) : null, name: field, label: label, disabled: visibility.readOnly, required: visibility.required, onChange: (date) => handleChange(field, date ? date.toDate() : null), onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg, dirty: dirty, autoFocus: autoFocus, onError: (error) => {
                    this.error = error
                        ? ccI18n.t("backend-integration.model.types.renderers.date.validation-error")
                        : "";
                    setFieldTouched(field, touched, true);
                }, helperText: errorMsg || warningMsg || undefined, fullWidth: true }));
        }
        return (_jsxs(Typography, { children: [!visibility.grid && `${label}: `, value
                    ? value.toLocaleString(getCurrentLocale(ccI18n))
                    : ccI18n.t("backend-integration.model.types.renderers.date.not-set")] }));
    }
}
export default RendererDateTimeNullable;
