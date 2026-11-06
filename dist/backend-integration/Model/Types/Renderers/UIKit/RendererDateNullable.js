import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Typography } from "@mui/material";
import TypeDateNullable from "../../TypeDateNullable";
import ccI18n from "../../../../../i18n";
import getCurrentLocale from "../../../../../utils/getCurrentLocale";
import { formatDateOnly } from "../../../../../utils/dateOnlyUtils";
import { DateInput } from "../../../../../standalone";
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
        const { visibility, field, value, touched, label, handleChange, handleBlur, errorMsg, warningMsg, dirty, autoFocus, setFieldTouched, } = params;
        if (visibility.disabled)
            return _jsx(_Fragment, {});
        if (visibility.hidden) {
            return (_jsx("input", { type: "hidden", name: field, value: value ? value.toISOString() : "", readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (_jsx(DateInput, { ...this.props, name: field, value: value, label: label, disabled: visibility.readOnly, required: visibility.required, onChange: (date) => handleChange(field, date), onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg, dirty: dirty, autoFocus: autoFocus, onError: (error) => {
                    this.error = error
                        ? ccI18n.t("backend-integration.model.types.renderers.date.validation-error")
                        : "";
                    setFieldTouched(field, touched, true);
                }, helperText: errorMsg || warningMsg || undefined, fullWidth: true }));
        }
        return (_jsxs(Typography, { children: [!visibility.grid && `${label}: `, value
                    ? formatDateOnly(value, getCurrentLocale(ccI18n), ToDateLocaleStringOptions)
                    : ccI18n.t("backend-integration.model.types.renderers.date.not-set")] }));
    }
    dataGridColumnSizingHint = () => {
        const def = Math.max(ccI18n.t("backend-integration.model.types.renderers.date.not-set")
            .length, 10) * 10;
        return [0, Number.MAX_SAFE_INTEGER, def];
    };
}
export default RendererDateNullable;
