import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FormControlLabel, FormHelperText, Typography } from "@mui/material";
import TypeBoolean from "../../TypeBoolean";
import ccI18n from "../../../../../i18n";
import Checkbox from "../../../../../standalone/UIKit/Checkbox";
import { FormControlFieldsetCC } from "../../../../../standalone";
/**
 * Renders a TypeBoolean field as Checkbox
 */
class RendererBooleanCheckbox extends TypeBoolean {
    invert;
    constructor(invert) {
        super();
        this.invert = invert;
    }
    render(params) {
        const { visibility, field, value, label, handleChange, handleBlur, errorMsg, warningMsg, } = params;
        if (visibility.disabled)
            return _jsx(_Fragment, {});
        if (visibility.hidden) {
            return (_jsx("input", { type: "hidden", name: field, checked: value, readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            const control = (_jsx(Checkbox, { name: field, checked: this.invert ? !value : !!value, disabled: visibility.readOnly, onChange: (evt, checked) => {
                    handleChange(evt.target.name, this.invert ? !checked : checked);
                }, onBlur: handleBlur, "data-name": field }));
            return visibility.grid ? (control) : (_jsxs(FormControlFieldsetCC, { required: visibility.required, error: !!errorMsg, warning: !!warningMsg, component: "fieldset", "data-name": field, children: [_jsx(FormControlLabel, { control: control, label: label }), _jsx(FormHelperText, { children: errorMsg || warningMsg })] }));
        }
        return (_jsxs(Typography, { children: [!visibility.grid && `${label}: `, value
                    ? ccI18n.t("backend-integration.model.types.renderers.boolean.true")
                    : ccI18n.t("backend-integration.model.types.renderers.boolean.false")] }));
    }
}
export default RendererBooleanCheckbox;
