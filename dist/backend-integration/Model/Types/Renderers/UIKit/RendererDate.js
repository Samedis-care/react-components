import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Typography } from "@mui/material";
import TypeDate from "../../TypeDate";
import ccI18n from "../../../../../i18n";
import getCurrentLocale from "../../../../../utils/getCurrentLocale";
import { formatDateOnly } from "../../../../../utils/dateOnlyUtils";
import { DateInput, FormHelperTextCC } from "../../../../../standalone";
import { ToDateLocaleStringOptions } from "../../../../../constants";
/**
 * Renders a non-nullable Date with Date Selector
 */
class RendererDate extends TypeDate {
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
            return (_jsx("input", { type: "hidden", name: field, value: value.toISOString(), readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (_jsxs(_Fragment, { children: [_jsx(DateInput, { ...this.props, name: field, value: value, label: label, disabled: visibility.readOnly, required: visibility.required, onChange: (date) => {
                            // The field can be emptied even though this type cannot hold null:
                            // that is an invalid entry, so it surfaces as a validation error
                            // and the model value stays.
                            if (!date) {
                                this.error = ccI18n.t("backend-integration.model.types.renderers.date.validation-error");
                                setFieldTouched(field, touched, true);
                                return;
                            }
                            this.error = "";
                            handleChange(field, date);
                        }, onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg, dirty: dirty, autoFocus: autoFocus, onError: (error) => {
                            this.error = error
                                ? ccI18n.t("backend-integration.model.types.renderers.date.validation-error")
                                : "";
                            setFieldTouched(field, touched, true);
                        }, fullWidth: true }), _jsx(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg, children: errorMsg || warningMsg })] }));
        }
        return (_jsxs(Typography, { children: [!visibility.grid && `${label}: `, formatDateOnly(value, getCurrentLocale(ccI18n), ToDateLocaleStringOptions)] }));
    }
    dataGridColumnSizingHint = () => [
        0,
        Number.MAX_SAFE_INTEGER,
        10 * 10, // date length
    ];
}
export default RendererDate;
