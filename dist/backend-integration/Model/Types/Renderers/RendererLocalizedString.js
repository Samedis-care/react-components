import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Typography } from "@mui/material";
import MultiLanguageInput from "../../../../standalone/UIKit/InputControls/MultiLanguageInput";
import TypeLocalizedString from "../TypeLocalizedString";
import { FormHelperTextCC } from "../../../../standalone/UIKit/MuiFieldState";
/**
 * Renders a localized string: a MultiLanguageInput when editable, otherwise
 * its text in the UI language, falling back to `defaultLanguage` and then to
 * the first enabled language that has text (see getFallbackLabel)
 */
class RendererLocalizedString extends TypeLocalizedString {
    props;
    settings;
    extra;
    constructor(props) {
        super(props?.multiline, props?.enabledLanguages ?? null, props?.defaultLanguage ?? null);
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
        const { visibility, field, value, label, handleChange, handleBlur, errorMsg, warningMsg, dirty, autoFocus, } = params;
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
                        }, onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg, dirty: dirty, autoFocus: autoFocus }), _jsx(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg, children: errorMsg || warningMsg })] }));
        }
        const uiLanguageText = this.getUiLanguageText(value);
        const fallbackLabel = uiLanguageText
            ? ""
            : (this.extra.getFallbackLabel?.(value, params.values) ?? "");
        const fallbackText = uiLanguageText || fallbackLabel ? null : this.getFallbackText(value);
        return (_jsxs(Typography, { noWrap: visibility.grid, children: [!visibility.grid && `${label}: `, fallbackText ? (_jsx("span", { lang: fallbackText.language, children: fallbackText.text })) : ((uiLanguageText?.text ?? fallbackLabel))] }));
    }
}
export default RendererLocalizedString;
