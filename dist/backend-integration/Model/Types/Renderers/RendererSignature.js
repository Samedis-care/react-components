import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { FormControl, FormHelperText, FormLabel } from "@mui/material";
import ccI18n from "../../../../i18n";
import TypeImage from "../TypeImage";
import { FormControlCC } from "../../../../standalone/UIKit/MuiWarning";
import SignaturePad from "../../../../non-standalone/SignaturePad/SignaturePad";
export const SignatureNameContext = React.createContext(null);
/**
 * Renders a signature field (for electronic signing)
 * Wrap FormField with SignatureNameContext.Provider for name context
 */
class RendererSignature extends TypeImage {
    render(params) {
        const { visibility, field, value, label, handleChange, handleBlur, errorMsg, warningMsg, } = params;
        if (visibility.disabled)
            return _jsx(_Fragment, {});
        if (visibility.hidden) {
            return (_jsx("input", { type: "hidden", name: field, value: value, readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (_jsxs(FormControlCC, { required: visibility.required, fullWidth: true, error: !!errorMsg, warning: !!warningMsg, onBlur: handleBlur, "data-name": field, children: [_jsx(FormLabel, { component: "legend", children: label }), _jsx(SignatureNameContext.Consumer, { children: (signerName) => (_jsx(SignaturePad, { name: field, signature: value, setSignature: (newValue) => handleChange(field, newValue), disabled: visibility.readOnly, signerName: signerName })) }), _jsx(FormHelperText, { children: errorMsg || warningMsg })] }));
        }
        const content = value ? (_jsx("img", { src: value, alt: label })) : (_jsx(_Fragment, { children: ccI18n.t("backend-integration.model.types.renderers.signature.not-set") }));
        return visibility.grid ? (content) : (_jsxs(FormControl, { children: [_jsx(FormLabel, { children: label }), content] }));
    }
}
export default RendererSignature;
