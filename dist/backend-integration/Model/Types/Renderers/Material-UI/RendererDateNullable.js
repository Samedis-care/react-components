import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Typography } from "@mui/material";
import TypeDateNullable from "../../TypeDateNullable";
import ccI18n from "../../../../../i18n";
import getCurrentLocale from "../../../../../utils/getCurrentLocale";
import { normalizeDate } from "../../Utils/DateUtils";
import { LocalizedKeyboardDatePicker } from "../../../../../standalone/LocalizedDateTimePickers";
import { ToDateLocaleStringOptions } from "../../../../../constants";
import { FormHelperTextCC } from "../../../../../standalone/UIKit/MuiWarning";
import moment from "moment";
/**
 * Renders Date with Date Selector
 */
class RendererDateNullable extends TypeDateNullable {
    render(params) {
        const { visibility, field, value, touched, label, handleChange, handleBlur, errorMsg, warningMsg, setFieldTouched, } = params;
        if (visibility.disabled)
            return _jsx(_Fragment, {});
        if (visibility.hidden) {
            return (_jsx("input", { type: "hidden", name: field, value: value ? value.toISOString() : "", readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (_jsxs(_Fragment, { children: [_jsx(LocalizedKeyboardDatePicker, { name: field, value: value ? moment(value) : null, label: label, disabled: visibility.readOnly, required: visibility.required, onChange: (date) => handleChange(field, date ? normalizeDate(date.toDate()) : null), onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg, onError: (error) => {
                            this.error = error
                                ? ccI18n.t("backend-integration.model.types.renderers.date.validation-error")
                                : "";
                            setFieldTouched(field, touched, true);
                        }, fullWidth: true }), _jsx(FormHelperTextCC, { warning: !!warningMsg, error: !!errorMsg, children: errorMsg || warningMsg })] }));
        }
        return (_jsxs(Typography, { children: [!visibility.grid && `${label}: `, value
                    ? value.toLocaleDateString(getCurrentLocale(ccI18n), ToDateLocaleStringOptions)
                    : ccI18n.t("backend-integration.model.types.renderers.date.not-set")] }));
    }
    dataGridColumnSizingHint = () => {
        const def = Math.max(ccI18n.t("backend-integration.model.types.renderers.date.not-set")
            .length, 10) * 10;
        return [0, Number.MAX_SAFE_INTEGER, def];
    };
}
export default RendererDateNullable;
