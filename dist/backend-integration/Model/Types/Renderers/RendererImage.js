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
import { FormControl, FormLabel } from "@material-ui/core";
import ImageSelector from "../../../../standalone/FileUpload/Image/ImageSelector";
import ccI18n from "../../../../i18n";
import TypeImage from "../TypeImage";
import { FormHelperTextCC } from "../../../../standalone";
/**
 * Renders an image selector
 */
var RendererImage = /** @class */ (function (_super) {
    __extends(RendererImage, _super);
    function RendererImage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RendererImage.prototype.render = function (params) {
        var _a, _b, _c, _d, _e, _f;
        var visibility = params.visibility, field = params.field, value = params.value, label = params.label, handleChange = params.handleChange, handleBlur = params.handleBlur, errorMsg = params.errorMsg, warningMsg = params.warningMsg;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: value, readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (React.createElement(React.Fragment, null,
                React.createElement(ImageSelector, { name: field, value: value, label: label, readOnly: visibility.readOnly, onChange: function (name, value) {
                        handleChange(name, value);
                    }, onBlur: handleBlur, alt: label, capture: (_b = (_a = this.params) === null || _a === void 0 ? void 0 : _a.capture) !== null && _b !== void 0 ? _b : false, uploadLabel: (_c = this.params) === null || _c === void 0 ? void 0 : _c.uploadLabel, convertImagesTo: (_d = this.params) === null || _d === void 0 ? void 0 : _d.convertImagesTo, downscale: (_e = this.params) === null || _e === void 0 ? void 0 : _e.downscale, variant: (_f = this.params) === null || _f === void 0 ? void 0 : _f.variant }),
                React.createElement(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg }, errorMsg || warningMsg)));
        }
        var content = value ? (React.createElement("img", { src: value, alt: label, style: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" } })) : (React.createElement(React.Fragment, null, ccI18n.t("backend-integration.model.types.renderers.image.not-set")));
        return visibility.grid ? (content) : (React.createElement(FormControl, null,
            React.createElement(FormLabel, null, label),
            content));
    };
    return RendererImage;
}(TypeImage));
export default RendererImage;
