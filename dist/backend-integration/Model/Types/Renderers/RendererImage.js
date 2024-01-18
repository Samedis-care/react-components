import React from "react";
import { FormControl, FormLabel } from "@mui/material";
import ImageSelector from "../../../../standalone/FileUpload/Image/ImageSelector";
import ccI18n from "../../../../i18n";
import TypeImage from "../TypeImage";
import { FormHelperTextCC } from "../../../../standalone";
/**
 * Renders an image selector
 */
class RendererImage extends TypeImage {
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
            return (React.createElement(React.Fragment, null,
                React.createElement(ImageSelector, { name: field, value: value, label: label, readOnly: visibility.readOnly, onChange: (name, value) => {
                        handleChange(name, value);
                    }, onBlur: handleBlur, alt: label, capture: this.params?.capture ?? false, uploadLabel: this.params?.uploadLabel, convertImagesTo: this.params?.convertImagesTo, downscale: this.params?.downscale, variant: this.params?.variant, postEditCallback: this.params?.postEditCallback }),
                React.createElement(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg }, errorMsg || warningMsg)));
        }
        const content = value ? (React.createElement("img", { src: value, alt: label, style: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" } })) : (React.createElement(React.Fragment, null, ccI18n.t("backend-integration.model.types.renderers.image.not-set")));
        return visibility.grid ? (content) : (React.createElement(FormControl, null,
            React.createElement(FormLabel, null, label),
            content));
    }
}
export default RendererImage;
