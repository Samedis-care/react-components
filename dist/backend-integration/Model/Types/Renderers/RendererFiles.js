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
import ccI18n from "../../../../i18n";
import TypeFiles from "../TypeFiles";
import FileUpload from "../../../../standalone/FileUpload/Generic";
import GroupBox from "../../../../standalone/GroupBox";
import { FormHelperTextCC } from "../../../../standalone";
/**
 * Renders a file selector
 */
var RendererFiles = /** @class */ (function (_super) {
    __extends(RendererFiles, _super);
    function RendererFiles() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RendererFiles.prototype.render = function (params) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        var visibility = params.visibility, field = params.field, value = params.value, label = params.label, handleChange = params.handleChange, handleBlur = params.handleBlur, errorMsg = params.errorMsg, warningMsg = params.warningMsg, setError = params.setError;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: value.map(function (entry) { return entry.file.name; }).join(","), readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (React.createElement(React.Fragment, null,
                React.createElement("div", null,
                    React.createElement(FileUpload, { name: field, label: label, files: value, readOnly: visibility.readOnly, onChange: function (files) {
                            handleChange(field, files);
                        }, onBlur: handleBlur, handleError: function (_, msg) { return setError(new Error(msg)); }, maxFiles: (_a = this.params) === null || _a === void 0 ? void 0 : _a.maxFiles, accept: (_b = this.params) === null || _b === void 0 ? void 0 : _b.accept, acceptLabel: (_c = this.params) === null || _c === void 0 ? void 0 : _c.acceptLabel, imageDownscaleOptions: (_d = this.params) === null || _d === void 0 ? void 0 : _d.imageDownscaleOptions, convertImagesTo: (_e = this.params) === null || _e === void 0 ? void 0 : _e.convertImagesTo, previewSize: ((_f = this.params) === null || _f === void 0 ? void 0 : _f.previewSize) || 96, previewImages: (_g = this.params) === null || _g === void 0 ? void 0 : _g.previewImages, allowDuplicates: (_h = this.params) === null || _h === void 0 ? void 0 : _h.allowDuplicates, smallLabel: (_j = this.params) === null || _j === void 0 ? void 0 : _j.smallLabel })),
                React.createElement(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg }, errorMsg || warningMsg)));
        }
        var content = (React.createElement(React.Fragment, null,
            React.createElement("ul", null, value.map(function (entry, index) { return (React.createElement("li", { key: index },
                entry.preview && (React.createElement("img", { src: entry.preview, alt: entry.file.name })),
                !entry.preview && "downloadLink" in entry.file && (React.createElement("a", { href: entry.file.downloadLink }, entry.file.name)))); })),
            value.length === 0 &&
                ccI18n.t("backend-integration.model.types.renderers.files.no-file")));
        return visibility.grid ? (content) : (React.createElement(GroupBox, { label: label }, content));
    };
    return RendererFiles;
}(TypeFiles));
export default RendererFiles;
