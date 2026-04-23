import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FormControl, FormLabel } from "@mui/material";
import ImageSelector from "../../../../standalone/FileUpload/Image/ImageSelector";
import ccI18n from "../../../../i18n";
import TypeImage from "../TypeImage";
import { FormHelperTextCC } from "../../../../standalone/UIKit/MuiWarning";
/**
 * Renders an image selector
 */
class RendererImage extends TypeImage {
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
            return (_jsxs(_Fragment, { children: [_jsx(ImageSelector, { name: field, value: value || (this.params?.placeholder ?? ""), label: label, readOnly: visibility.readOnly, onChange: (name, value) => {
                            handleChange(name, value);
                        }, onBlur: handleBlur, alt: label, capture: this.params?.capture ?? false, uploadLabel: this.params?.uploadLabel, convertImagesTo: this.params?.convertImagesTo, downscale: this.params?.downscale, variant: this.params?.variant, postEditCallback: this.params?.postEditCallback }), _jsx(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg, children: errorMsg || warningMsg })] }));
        }
        const content = value || this.params?.placeholder ? (_jsx("img", { src: value || (this.params?.placeholder ?? ""), alt: label, style: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" } })) : (_jsx(_Fragment, { children: ccI18n.t("backend-integration.model.types.renderers.image.not-set") }));
        return visibility.grid ? (content) : (_jsxs(FormControl, { children: [_jsx(FormLabel, { children: label }), content] }));
    }
}
export default RendererImage;
