import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Typography } from "@mui/material";
import MultiLanguageInput from "../../../../standalone/UIKit/InputControls/MultiLanguageInput";
import TypeLocalizedString from "../TypeLocalizedString";
import { FormHelperTextCC } from "../../../../standalone/UIKit/MuiWarning";
/**
 * Renders a text field
 */
class RendererLocalizedString extends TypeLocalizedString {
    props;
    settings;
    extra;
    constructor(props) {
        super(props?.multiline);
        const { getFallbackLabel, getFallbackLabelValues, ...other } = props;
        this.props = other;
        this.extra = {
            getFallbackLabel,
            getFallbackLabelValues,
        };
        this.settings = {
            updateHooks: getFallbackLabelValues,
        };
    }
    render(params) {
        const { visibility, field, value, label, handleChange, handleBlur, errorMsg, warningMsg, } = params;
        if (visibility.disabled)
            return _jsx(_Fragment, {});
        if (visibility.hidden) {
            return (_jsx("input", { type: "hidden", name: field, value: JSON.stringify(value ?? {}), readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (_jsxs(_Fragment, { children: [_jsx(MultiLanguageInput, { ...this.props, name: field, values: value ?? {}, label: label, disabled: visibility.readOnly, required: visibility.required, onChange: (newValues) => {
                            handleChange(field, newValues);
                        }, onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg }), _jsx(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg, children: errorMsg || warningMsg })] }));
        }
        return (_jsxs(Typography, { noWrap: visibility.grid, children: [!visibility.grid && `${label}: `, this.stringify(value) ||
                    (this.extra.getFallbackLabel
                        ? this.extra.getFallbackLabel(value, params.values)
                        : "")] }));
    }
}
export default RendererLocalizedString;
