import React from "react";
import { Typography } from "@mui/material";
import MultiLanguageInput from "../../../../standalone/UIKit/InputControls/MultiLanguageInput";
import TypeLocalizedString from "../TypeLocalizedString";
import { FormHelperTextCC } from "../../../../standalone";
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
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: JSON.stringify(value ?? {}), readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (React.createElement(React.Fragment, null,
                React.createElement(MultiLanguageInput, { ...this.props, name: field, values: value ?? {}, label: label, disabled: visibility.readOnly, required: visibility.required, onChange: (newValues) => {
                        handleChange(field, newValues);
                    }, onBlur: handleBlur, error: !!errorMsg, warning: !!warningMsg }),
                React.createElement(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg }, errorMsg || warningMsg)));
        }
        return (React.createElement(Typography, { noWrap: visibility.grid },
            !visibility.grid && `${label}: `,
            this.stringify(value) ||
                (this.extra.getFallbackLabel
                    ? this.extra.getFallbackLabel(value, params.values)
                    : "")));
    }
}
export default RendererLocalizedString;
