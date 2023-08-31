import React from "react";
import { FormControl, FormHelperText, FormLabel } from "@mui/material";
import ccI18n from "../../../../i18n";
import TypeImage from "../TypeImage";
import { SignaturePad } from "../../../../non-standalone";
import { FormControlCC } from "../../../../standalone";
/**
 * Renders an signature field (for electronic signing)
 */
class RendererSignature extends TypeImage {
    render(params) {
        const { visibility, field, value, label, handleChange, handleBlur, errorMsg, warningMsg, } = params;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: value, readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (React.createElement(FormControlCC, { required: visibility.required, fullWidth: true, error: !!errorMsg, warning: !!warningMsg, onBlur: handleBlur, "data-name": field },
                React.createElement(FormLabel, { component: "legend" }, label),
                React.createElement(SignaturePad, { name: field, signature: value, setSignature: (newValue) => handleChange(field, newValue), disabled: visibility.readOnly }),
                React.createElement(FormHelperText, null, errorMsg || warningMsg)));
        }
        const content = value ? (React.createElement("img", { src: value, alt: label })) : (React.createElement(React.Fragment, null, ccI18n.t("backend-integration.model.types.renderers.signature.not-set")));
        return visibility.grid ? (content) : (React.createElement(FormControl, null,
            React.createElement(FormLabel, null, label),
            content));
    }
}
export default RendererSignature;
