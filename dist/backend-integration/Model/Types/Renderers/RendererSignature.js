var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import React from "react";
import { FormControl, FormHelperText, FormLabel } from "@mui/material";
import ccI18n from "../../../../i18n";
import TypeImage from "../TypeImage";
import { SignaturePad } from "../../../../non-standalone";
import { FormControlCC } from "../../../../standalone";
/**
 * Renders an signature field (for electronic signing)
 */
var RendererSignature = /** @class */ (function (_super) {
    __extends(RendererSignature, _super);
    function RendererSignature() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RendererSignature.prototype.render = function (params) {
        var visibility = params.visibility, field = params.field, value = params.value, label = params.label, handleChange = params.handleChange, handleBlur = params.handleBlur, errorMsg = params.errorMsg, warningMsg = params.warningMsg;
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
                React.createElement(SignaturePad, { name: field, signature: value, setSignature: function (newValue) { return handleChange(field, newValue); }, disabled: visibility.readOnly }),
                React.createElement(FormHelperText, null, errorMsg || warningMsg)));
        }
        var content = value ? (React.createElement("img", { src: value, alt: label })) : (React.createElement(React.Fragment, null, ccI18n.t("backend-integration.model.types.renderers.signature.not-set")));
        return visibility.grid ? (content) : (React.createElement(FormControl, null,
            React.createElement(FormLabel, null, label),
            content));
    };
    return RendererSignature;
}(TypeImage));
export default RendererSignature;
