import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Typography } from "@mui/material";
import ccI18n from "../../../../../i18n";
import getCurrentLocale from "../../../../../utils/getCurrentLocale";
import { denormalizeDate, formatDateOnly, normalizeDate, } from "../../../../../utils/dateOnlyUtils";
import TypeDate from "../../TypeDate";
import { LocalizedKeyboardDatePicker } from "../../../../../standalone/LocalizedDateTimePickers";
import { ToDateLocaleStringOptions } from "../../../../../constants";
import { FormHelperTextCC } from "../../../../../standalone/UIKit/MuiWarning";
import moment from "moment";
/**
 * Renders Date with Date Selector
 */
class RendererDate extends TypeDate {
    render(params) {
        const { visibility, field, value, touched, label, handleChange, handleBlur, errorMsg, setFieldTouched, warningMsg, } = params;
        if (visibility.disabled)
            return _jsx(_Fragment, {});
        if (visibility.hidden) {
            return (_jsx("input", { type: "hidden", name: field, value: value ? value.toISOString() : "", readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (_jsxs(_Fragment, { children: [_jsx(LocalizedKeyboardDatePicker, { name: field, value: value ? moment(denormalizeDate(value)) : null, label: label, disabled: visibility.readOnly, required: visibility.required, onChange: (date) => {
                            // The field can be emptied — by the clear button, or by deleting
                            // a single section — even though this type cannot hold null. That
                            // is the user entering an invalid date, not a broken caller, so
                            // it has to surface as a validation error rather than throw
                            // inside a React event handler.
                            if (!date) {
                                this.error = ccI18n.t("backend-integration.model.types.renderers.date.validation-error");
                                setFieldTouched(field, touched, true);
                                return;
                            }
                            this.error = "";
                            handleChange(field, normalizeDate(date.toDate()));
                        }, onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg, onError: (error) => {
                            this.error = error
                                ? ccI18n.t("backend-integration.model.types.renderers.date.validation-error")
                                : "";
                            setFieldTouched(field, touched, true);
                        }, fullWidth: true, disableClearable: true }), _jsx(FormHelperTextCC, { warning: !!warningMsg, error: !!errorMsg, children: errorMsg || warningMsg })] }));
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
export default RendererDate;
